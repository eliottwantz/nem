import { STRIPE_PRODUCT_ID_TRIAL } from '$env/static/private'
import { fetchers, safeFetch } from '$lib/api'
import { stripe } from '$lib/server/stripe'
import { error, json, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'

export async function POST({ request, locals: { session, user }, url, params }) {
	if (!session || !user) throw redirect(307, '/login')

	const res = await safeFetch(
		fetchers.teacherService(fetch, session).findTeacherByID({ id: params.id })
	)
	if (!res.ok) {
		console.log(res.error)
		throw error(res.error.status, 'Teacher not found')
	}

	debugger
	try {
		const stripeSession = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card', 'paypal'],
			metadata: {
				userId: user.id
			},
			line_items: [
				{
					price_data: {
						currency: 'USD',
						unit_amount: res.data.teacher.hourRate * 0.5 * 100, // 50% of the price
						product: STRIPE_PRODUCT_ID_TRIAL
					},
					quantity: 1
				}
			],
			billing_address_collection: 'required',
			phone_number_collection: {
				enabled: false
			},
			success_url: `${url.origin}${url.pathname}/success`,
			cancel_url: `${url.origin}${url.pathname}/cancel`
		})
		if (!stripeSession.url) throw error(500, 'Something went wrong')
		return json({ url: stripeSession.url }, { status: 200 })
	} catch (e) {
		console.log(e)
		throw error(500, 'Something went wrong')
	}
}
