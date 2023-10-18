// in src/routes/stripe/webhooks/+server.js
import { dev } from '$app/environment'
import { STRIPE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET_DEV } from '$env/static/private'
import { fetchers, safeFetch } from '$lib/api'
import { stripe, type TrialClassMetaData } from '$lib/server/stripe'
import { error, json } from '@sveltejs/kit'
import type Stripe from 'stripe'

export async function POST({ request, locals: { session } }) {
	debugger
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
		return json(
			{ message: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` },
			{ status: 400 }
		)
	}

	switch (event.type) {
		case 'checkout.session.completed':
			const stripeSession = event.data.object as Stripe.Checkout.Session & {
				metadata: TrialClassMetaData
			}
			if (!session) return json({ message: 'No user session found' }, { status: 400 })
			const res = await safeFetch(
				fetchers.classService(fetch, session).createOrJoinClass({
					req: {
						isPrivate: Boolean(stripeSession.metadata.isPrivate),
						language: stripeSession.metadata.language,
						topic: stripeSession.metadata.topic,
						name: stripeSession.metadata.name,
						timeSlotId: stripeSession.metadata.timeSlotId
					}
				})
			)
			if (!res.ok) {
				console.log(res.error)
				return json({ message: res.cause }, { status: res.error.status })
			}
			break
		default:
			console.log(`Unhandled event type ${event.type}`)
	}
	return json({}, { status: 200 })
}
