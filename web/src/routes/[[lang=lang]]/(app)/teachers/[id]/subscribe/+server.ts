import { route } from '$lib/ROUTES'
import {
	stripe,
	type StripeSubscriptionRequest,
	type SubscriptionMetadata
} from '$lib/server/stripe'
import { safeDBCall } from '$lib/utils/error'
import { error, json, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'

export const POST = async ({
	request,
	locals: { db, session, user, lang, message },
	url,
	params
}) => {
	if (!session || !user) throw redirect(307, route('/signin', { lang }))

	const res = await safeDBCall(db.teacher.findUnique({ where: { id: params.id } }))
	if (!res.ok) {
		console.log(res.error)
		return message({ type: 'error', text: 'Teacher not Found' }, { status: 404 })
	}
	try {
		const req = (await request.json()) as StripeSubscriptionRequest
		const customer = await stripe.customers.retrieve(user.stripeCustomerId)
		const stripeSession = await stripe.checkout.sessions.create({
			customer: customer.id,
			subscription_data: {
				metadata: {
					studentId: user.id,
					teacherId: params.id,
					subId: `${req.subscription.id}`,
					hours: `${req.hours}`
				} satisfies SubscriptionMetadata
			},
			mode: 'subscription',
			payment_method_types: ['card'],
			metadata: {
				studentId: user.id,
				teacherId: params.id,
				subId: `${req.subscription.id}`,
				hours: `${req.hours}`
			} satisfies SubscriptionMetadata,
			line_items: [
				{
					price_data: {
						currency: 'USD',
						unit_amount: req.price * 100,
						product: req.subscription.id,
						recurring: {
							interval: 'month',
							interval_count: 1
						}
					},
					quantity: 1
				}
			],
			payment_method_collection: 'always',
			billing_address_collection: 'required',
			phone_number_collection: {
				enabled: false
			},
			locale: user.preferedLanguage as Stripe.Checkout.SessionCreateParams.Locale,
			success_url: `${url.origin}${url.pathname}`.replace('subscribe', '?subscribe=success'),
			cancel_url: `${url.origin}${url.pathname}`.replace('subscribe', '?subscribe=cancel')
		})
		if (!stripeSession.url) throw error(500, 'Something went wrong')
		return json({ url: stripeSession.url }, { status: 200 })
	} catch (e) {
		console.log(e)
		return message({ type: 'error', text: 'Something went wrong' }, { status: 500 })
	}
}
