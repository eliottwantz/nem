import { fetchers, safeFetch } from '$lib/api'
import type { Subscription } from '$lib/api/api.gen'
import {
	createStripeCustomer,
	stripe,
	type StripeSubscriptionRequest,
	type SubscriptionMetadata
} from '$lib/server/stripe'
import { error, json, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'

export async function POST({ request, locals: { session, user }, fetch, url, params }) {
	if (!session || !user) throw redirect(307, '/login')

	const res = await safeFetch(
		fetchers.teacherService(fetch, session).findTeacherByID({ id: params.id })
	)
	if (!res.ok) {
		console.log(res.error)
		return json({ message: 'Teacher not Found' }, { status: res.error.status })
	}
	try {
		const req = (await request.json()) as StripeSubscriptionRequest

		let customer: Stripe.Customer
		if (user.stripeCustomerId) {
			const customerRes = await stripe.customers.retrieve(user.stripeCustomerId)
			if (!customerRes.deleted) customer = customerRes
			else customer = await createStripeCustomer(user, fetch, session)
		} else customer = await createStripeCustomer(user, fetch, session)

		debugger
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
		return json({ message: 'Something went wrong' }, { status: 500 })
	}
}
