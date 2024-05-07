import { STRIPE_WEBHOOK_SECRET } from '$env/static/private'
import { prisma } from '$lib/server/prisma'
import { stripe } from '$lib/server/stripe'
import { safeDBCall } from '$lib/utils/error'
import type Stripe from 'stripe'

export const POST = async ({ request }) => {
	console.log('STRIPE CONNECT WEBHOOK')
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
		case 'account.updated':
			{
				const res = await safeDBCall(
					prisma.stripeAccount.update({
						where: { id: event.account },
						data: {
							chargesEnabled: event.data.object.charges_enabled,
							transfersEnabled: event.data.object.payouts_enabled,
							detailsSubmitted: event.data.object.details_submitted
						}
					})
				)
				if (!res.ok) {
					return new Response('Failed to update account details', { status: 500 })
				}
			}
			break
		default:
			console.log(`Unhandled event type ${event.type}`)
			return new Response(null, { status: 400 })
	}
	return new Response(null, { status: 200 })
}
