import { STRIPE_SECRET_KEY } from '$env/static/private'
import Stripe from 'stripe'

export const trialClassStripe: Partial<Stripe.Product> = {
	name: 'Trial class'
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16'
})
