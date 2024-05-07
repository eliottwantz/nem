import { STRIPE_WEBHOOK_SECRET } from '$env/static/private'
import { prisma } from '$lib/server/prisma'
import { stripe, type ClassPaymentMetaData, type SubscriptionMetadata } from '$lib/server/stripe'
import { AppError, safeDBCall } from '$lib/utils/error'
import type Stripe from 'stripe'

export const POST = async ({ request }) => {
	console.log('STRIPE WEBHOOK')
	const body = await request.text()
	const sig = request.headers.get('stripe-signature') ?? ''

	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
	} catch (err) {
		return new Response(
			`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
			{ status: 400 }
		)
	}

	switch (event.type) {
		case 'checkout.session.completed':
			// TODO: change to checkout.session.async_payment_succeeded
			if ((event.data.object as Stripe.Checkout.Session).mode === 'payment') {
				const stripeSession = event.data.object as Stripe.Checkout.Session & {
					metadata: ClassPaymentMetaData
				}
				const res = await safeDBCall(
					prisma.$transaction(async (tx) => {
						const exists = await tx.class.findFirst({
							where: { timeSlotId: stripeSession.metadata.timeSlotId },
							include: {
								students: true
							}
						})
						if (exists) {
							// Add student to this class
							return await tx.class.update({
								where: { id: exists.id },
								data: {
									students: { connect: { id: stripeSession.metadata.userId } }
								}
							})
						} else {
							const timeSlot = await tx.timeSlot.findUnique({
								where: { id: stripeSession.metadata.timeSlotId }
							})
							if (!timeSlot)
								throw new AppError(
									'Time slot not found: ' + stripeSession.metadata.timeSlotId,
									404
								)
							// Create class
							return await tx.class.create({
								data: {
									timeSlotId: timeSlot.id,
									teacherId: timeSlot.teacherId,
									name: stripeSession.metadata.name,
									isPrivate: Boolean(stripeSession.metadata.isPrivate),
									isTrial: Boolean(stripeSession.metadata.isTrial),
									language: stripeSession.metadata.language,
									topic: stripeSession.metadata.topic,
									students: {
										connect: { id: stripeSession.metadata.userId }
									}
								}
							})
						}
					})
				)
				if (!res.ok) {
					console.log(res.error)
					return res.error instanceof AppError
						? new Response(res.error.message, { status: res.error.status })
						: new Response(
								'Failed to process payment for trial class for user ' +
									stripeSession.metadata.userId,
								{ status: 500 }
						  )
				}
			} else if (event.data.object.mode === 'subscription') {
				const stripeSession = event.data.object as Stripe.Checkout.Session & {
					metadata: SubscriptionMetadata
				}
				const res = await safeDBCall(
					prisma.studentSubscription.create({
						data: {
							studentId: stripeSession.metadata.studentId,
							teacherId: stripeSession.metadata.teacherId,
							subscriptionId: stripeSession.metadata.subId,
							stripeSubscriptionId: stripeSession.subscription!.toString()
						}
					})
				)
				if (!res.ok) {
					console.log(res.error)
					return res.error instanceof AppError
						? new Response(res.error.message, { status: res.error.status })
						: new Response(
								`Failed to create subscription for user ${stripeSession.metadata.studentId} with teacher ${stripeSession.metadata.teacherId}`,
								{ status: 500 }
						  )
				}
			}
			break
		case 'customer.subscription.updated':
			// Add hours to hoursBank of student when subscription renews
			const updateStripeSub = event.data.object as Stripe.Subscription & {
				metadata: SubscriptionMetadata
			}
			const updateRes = await safeDBCall(
				prisma.hoursBank.upsert({
					where: {
						studenId_teacherId: {
							studenId: updateStripeSub.metadata.studentId,
							teacherId: updateStripeSub.metadata.teacherId
						}
					},
					create: {
						hours: +updateStripeSub.metadata.hours,
						studenId: updateStripeSub.metadata.studentId,
						teacherId: updateStripeSub.metadata.teacherId
					},
					update: {
						hours: {
							increment: +updateStripeSub.metadata.hours
						}
					}
				})
			)
			if (!updateRes.ok) {
				console.log(updateRes.error)
				return new Response(
					`Failed to add hours for user ${updateStripeSub.metadata.studentId}`,
					{
						status: 500
					}
				)
			}
			break
		default:
			console.log(`Unhandled event type ${event.type}`)
			return new Response(null, { status: 400 })
	}
	return new Response(null, { status: 200 })
}
