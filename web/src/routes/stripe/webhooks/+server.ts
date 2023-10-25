import { dev } from '$app/environment'
import { STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_DEV } from '$env/static/private'
import { fetchers, safeFetch } from '$lib/api'
import type { Subscription } from '$lib/api/api.gen'
import { stripe, type ClassPaymentMetaData, type SubscriptionMetadata } from '$lib/server/stripe'
import type Stripe from 'stripe'

export async function POST({ request }) {
	const body = await request.text()
	const sig = request.headers.get('stripe-signature') ?? ''

	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(
			body,
			sig,
			dev ? STRIPE_WEBHOOK_SECRET_DEV : STRIPE_WEBHOOK_SECRET
		)
	} catch (err) {
		return new Response(
			`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
			{ status: 400 }
		)
	}

	switch (event.type) {
		case 'checkout.session.completed':
			if (event.data.object.mode === 'payment') {
				const stripeSession = event.data.object as Stripe.Checkout.Session & {
					metadata: ClassPaymentMetaData
				}
				const res = await safeFetch(
					fetchers.publicService(fetch).createOrJoinClass({
						req: {
							userId: stripeSession.metadata.userId,
							isPrivate: Boolean(stripeSession.metadata.isPrivate),
							isTrial: Boolean(stripeSession.metadata.isTrial),
							language: stripeSession.metadata.language,
							topic: stripeSession.metadata.topic,
							name: stripeSession.metadata.name,
							timeSlotId: stripeSession.metadata.timeSlotId
						}
					})
				)
				if (!res.ok) {
					console.log(res.error)
					return new Response(res.cause, { status: res.error.status })
				}
			} else if (event.data.object.mode === 'subscription') {
				const stripeSession = event.data.object as Stripe.Checkout.Session & {
					metadata: SubscriptionMetadata
				}
				const res = await safeFetch(
					fetchers.subscriptionService(fetch).addSubscriptionForStudent({
						studentId: stripeSession.metadata.studentId,
						subscriptionId: stripeSession.metadata.subId,
						teacherId: stripeSession.metadata.teacherId
					})
				)
				if (!res.ok) {
					console.log(res.error)
					return new Response(res.cause, { status: res.error.status })
				}
			}
			break
		case 'customer.subscription.updated':
			debugger
			// Add hours to hoursBank of student when subscription renews
			const stripeSub = event.data.object as Stripe.Subscription & {
				metadata: SubscriptionMetadata
			}
			const res = await safeFetch(
				fetchers.publicService(fetch).addHoursToHoursBank({
					hours: Number(stripeSub.metadata.hours),
					studentId: stripeSub.metadata.studentId,
					teacherId: stripeSub.metadata.teacherId
				})
			)
			if (!res.ok) {
				console.log(res.error)
				return new Response(res.cause, { status: res.error.status })
			}
			break
		default:
			console.log(`Unhandled event type ${event.type}`)
	}
	return new Response(null, { status: 200 })
}
