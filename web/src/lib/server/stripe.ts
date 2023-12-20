import { STRIPE_SECRET_KEY } from '$env/static/private'
import type { Subscription } from '@prisma/client'
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
