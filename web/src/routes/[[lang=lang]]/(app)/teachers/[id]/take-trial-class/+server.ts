import { STRIPE_PRODUCT_ID_TRIAL, STRIPE_TRIAL_DISCOUNT_COUPON_ID } from '$env/static/private'
import { route } from '$lib/ROUTES'
import { stripe, type ClassPaymentMetaData } from '$lib/server/stripe'
import type { TakeClassStore } from '$lib/stores/takeClassStore'
import { AppError, safeDBCall } from '$lib/utils/error'
import { json, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'

export const POST = async ({
	request,
	locals: { session, user, lang, db, message },
	url,
	params
}) => {
	if (!session || !user) throw redirect(307, route('/signin', { lang }))

	const res = await safeDBCall(
		db.$transaction(async (tx) => {
			const teacher = await tx.teacher.findUnique({
				where: {
					id: params.id
				},
				select: {
					hourRate: true,
					stripeAccount: true
				}
			})
			const student = await tx.student.findUnique({
				where: { id: user.id }
			})
			return {
				teacher,
				student
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return message({ type: 'error', text: 'Something went wrong' }, { status: 500 })
	}
	const { teacher, student } = res.value
	if (!teacher) {
		return message({ type: 'error', text: 'Teacher not Found' }, { status: 404 })
	}
	if (!student) {
		return message(
			{ type: 'error', text: 'Could not find your student profile' },
			{ status: 404 }
		)
	}
	if (
		!teacher.stripeAccount ||
		!teacher.stripeAccount.transfersEnabled ||
		!teacher.stripeAccount.chargesEnabled ||
		!teacher.stripeAccount.detailsSubmitted
	) {
		return message(
			{
				type: 'error',
				text: 'This teacher has not yet setup his payments, therefore you cannot book a class with that teacher'
			},
			{ status: 400 }
		)
	}

	try {
		const req = (await request.json()) as TakeClassStore
		const customer = await stripe.customers.retrieve(student.stripeCustomerId)
		const stripeSession = await stripe.checkout.sessions.create({
			customer: customer.id,
			invoice_creation: { enabled: true },
			mode: 'payment',
			metadata: {
				userId: user.id,
				isPrivate: 'true',
				isTrial: 'true',
				language: req.selectedLanguage!,
				topic: req.selectedTopic!,
				name: `${req.selectedLanguage} - ${req.selectedTopic}`,
				timeSlotId: req.selectedEvent!.event.id
			} satisfies ClassPaymentMetaData,
			line_items: [
				{
					price_data: {
						currency: 'USD',
						unit_amount: Math.ceil(teacher.hourRate * 100 * 1.05 * 0.5 + 100), // $1 & 5%  fee more for student & 50% off
						product: STRIPE_PRODUCT_ID_TRIAL
					},
					quantity: 1
				}
			],
			// discounts: [
			// 	{
			// 		coupon: STRIPE_TRIAL_DISCOUNT_COUPON_ID
			// 	}
			// ],
			payment_intent_data: {
				// application_fee_amount: teacher.hourRate * 100 * 0.05, // 5% fee for teacher
				transfer_data: {
					amount: Math.ceil(teacher.hourRate * 100 * 0.95 * 0.5) - 100, // 5% fee less for teacher & 50% off & $1 flat fee
					destination: teacher.stripeAccount.id
				}
			},
			locale: user.preferedLanguage as Stripe.Checkout.SessionCreateParams.Locale,
			success_url: `${url.origin}${url.pathname}`.replace(
				'take-trial-class',
				'?take-trial-class=success'
			),
			cancel_url: `${url.origin}${url.pathname}`.replace(
				'take-trial-class',
				'?take-trial-class=cancel'
			)
		})
		if (!stripeSession.url) {
			console.log('Failed to get url for stripe session with id:', stripeSession.id)
			return message(
				{ type: 'error', text: 'Something went wrong getting page checkout url' },
				{ status: 500 }
			)
		}
		return json({ url: stripeSession.url }, { status: 200 })
	} catch (e) {
		console.log(e)
		return message(
			{ type: 'error', text: e instanceof AppError ? e.message : 'Something went wrong' },
			{ status: 500 }
		)
	}
}
