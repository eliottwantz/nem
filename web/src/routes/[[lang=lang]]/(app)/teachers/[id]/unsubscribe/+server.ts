import { route } from '$lib/ROUTES'
import {
	stripe,
	type StripeSubscriptionRequest,
	type SubscriptionMetadata
} from '$lib/server/stripe'
import { safeDBCall } from '$lib/utils/error'
import { error, json, redirect } from '@sveltejs/kit'
import type Stripe from 'stripe'

export const POST = async ({
	request,
	locals: { db, session, user, lang, message },
	url,
	params
}) => {
	if (!session || !user) throw redirect(307, route('/signin', { lang }))

	const sub = await safeDBCall(
		db.studentSubscription.findUnique({
			where: {
				studentId_teacherId: {
					studentId: user.id,
					teacherId: params.id
				}
			}
		})
	)
	if (!sub.ok) {
		return message({ type: 'error', text: 'Subscription not found' }, { status: 404 })
	}

	const deleteRes = await safeDBCall(
		db.studentSubscription.delete({
			where: {
				studentId_teacherId: {
					studentId: user.id,
					teacherId: params.id
				}
			}
		})
	)
	if (!deleteRes.ok) {
		console.log(deleteRes.error)
		return message(
			{ type: 'error', text: 'Something went wrong canceling subscription' },
			{ status: 500 }
		)
	}

	try {
		await stripe.subscriptions.cancel(sub.value.stripeSubscriptionId, {
			prorate: true
		})
	} catch (e) {
		console.log(e)
		return message({ type: 'error', text: 'Something went wrong' }, { status: 500 })
	}

	return new Response()
}
