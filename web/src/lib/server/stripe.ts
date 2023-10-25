import { STRIPE_SECRET_KEY } from '$env/static/private'
import { fetchers } from '$lib/api'
import type { Fetch, Subscription, User } from '$lib/api/api.gen'
import type { Session } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16'
})

export type ClassPaymentMetaData = {
	userId: string
	isPrivate: string
	isTrial: string
	language: string
	topic: string
	name: string
	timeSlotId: string
}

export type SubscriptionMetadata = {
	studentId: string
	teacherId: string
	hours: string
	subId: string
}
export type StripeSubscriptionRequest = {
	teacherId: string
	subscription: Subscription
	hours: number
	price: number
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
