import { STRIPE_PRODUCT_ID_TRIAL, STRIPE_TRIAL_DISCOUNT_COUPON_ID } from '$env/static/private'
import { fetchers, safeFetch } from '$lib/api'
import { stripe, type TrialClassMetaData } from '$lib/server/stripe'
import type { TakeClassStore } from '$lib/stores/takeClassStore'
import { error, json, redirect } from '@sveltejs/kit'

export async function POST({ request, locals: { session, user }, url, params }) {
	if (!session || !user) throw redirect(307, '/login')

	const res = await safeFetch(
		fetchers.teacherService(fetch, session).findTeacherByID({ id: params.id })
	)
	if (!res.ok) {
		console.log(res.error)
		return json({ message: 'Teacher not Found' }, { status: res.error.status })
	}

	try {
		const req = (await request.json()) as TakeClassStore
		const stripeSession = await stripe.checkout.sessions.create({
			customer: user.id,
			customer_email: user.email,
			mode: 'payment',
			payment_method_types: ['card', 'paypal'],
			metadata: {
				userId: user.id,
				isPrivate: `${req.selectedIsPrivate}`,
				language: req.selectedLanguage!,
				topic: req.selectedTopic!,
				name: `${req.selectedLanguage} - ${req.selectedTopic}`,
				timeSlotId: req.selectedEvent!.event.id
			} satisfies TrialClassMetaData,
			line_items: [
				{
					price_data: {
						currency: 'USD',
						unit_amount: res.data.teacher.hourRate * 100, // 50% of the price
						product: STRIPE_PRODUCT_ID_TRIAL
					},
					quantity: 1
				}
			],
			discounts: [
				{
					coupon: STRIPE_TRIAL_DISCOUNT_COUPON_ID
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
		throw json({ message: 'Something went wrong' }, { status: 500 })
	}
}
