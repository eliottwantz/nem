import { STRIPE_SECRET_KEY } from '$env/static/private'
import { fetchers, safeFetch } from '$lib/api'
import type { Fetch, User } from '$lib/api/api.gen'
import type { Session } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16'
})

export type TrialClassMetaData = {
	userId: string
	isPrivate: string
	language: string
	topic: string
	name: string
	timeSlotId: string
}

export async function createStripeCustomer(user: User, f: Fetch, session: Session) {
	const customer = await stripe.customers.create({
		email: user.email,
		name: user.firstName + ' ' + user.lastName,
		preferred_locales: [user.preferedLanguage, 'en'],
		metadata: {
			userId: user.id,
			role: user.role
		}
	})
	await fetchers.userService(fetch, session).addStripeCustomerId({
		stripeId: customer.id
	})
	return customer
}
