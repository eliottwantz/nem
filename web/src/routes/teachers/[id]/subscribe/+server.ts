import { STRIPE_PRODUCT_ID_TRIAL, STRIPE_TRIAL_DISCOUNT_COUPON_ID } from '$env/static/private'
import { fetchers, safeFetch } from '$lib/api'
import { createStripeCustomer, stripe, type TrialClassMetaData } from '$lib/server/stripe'
import type { TakeClassStore } from '$lib/stores/takeClassStore'
import { error, json, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'

export type SubscriptionMetadata = {
	userId: string
	prodId: string
}

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
		const req = (await request.json()) as SubscriptionMetadata

		debugger
		let customer: Stripe.Customer
		if (user.stripeCustomerId) {
			const customerRes = await stripe.customers.retrieve(user.stripeCustomerId)
			if (!customerRes.deleted) customer = customerRes
			else customer = await createStripeCustomer(user, fetch, session)
		} else customer = await createStripeCustomer(user, fetch, session)

		const stripeSession = await stripe.checkout.sessions.create({
			customer: customer.id,
			invoice_creation: { enabled: true },
			mode: 'subscription',
			payment_method_types: ['card'],
			metadata: {
				userId: user.id,
				prodId: req.prodId
			} satisfies SubscriptionMetadata,
			line_items: [
				{
					price_data: {
						currency: 'USD',
						unit_amount: res.data.teacher.hourRate * 100,
						product: req.prodId
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
