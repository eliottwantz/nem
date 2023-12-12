import { stripe } from '$lib/server/stripe'
import { fail, redirect } from '@sveltejs/kit'
import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import type { ServerMessage } from '$lib/schemas/error'

export const load = async ({ cookies, locals: { session, user, lang, db } }) => {
	cookies.delete('account-id', { path: '/' })
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	if (user.role !== 'teacher') throw redirect(302, route('/dashboard/profile', { lang }))
	try {
		const res = await safeDBCall(
			db.teacher.findUnique({
				where: { id: user.id },
				select: { stripeAccountId: true }
			})
		)
		if (!res.ok) return
		const account = await stripe.accounts.retrieve(res.value.stripeAccountId)
		return {
			stripeConnected: account.details_submitted
		}
	} catch (e) {
		console.log(e)
		return
	}
}

export const actions = {
	createAccount: async ({ locals: { session, user, db, lang }, url, cookies }) => {
		if (!session || !user) throw redirect(302, route('/signin'))
		const teacher = await safeDBCall(
			db.teacher.findUnique({
				where: { id: user.id },
				select: { stripeAccountId: true }
			})
		)
		if (!teacher.ok)
			return fail(500, {
				type: 'error',
				text: 'Could not create account. Please try again later.'
			})
		if (teacher.value.stripeAccountId) return

		let accountLinkUrl = ''
		try {
			const [year, month, day] = user.birdthday.toISOString().split('T')[0].split('-')
			const account = await stripe.accounts.create({
				type: 'express',
				business_type: 'individual',
				email: session.user.email,
				metadata: {
					userId: user.id
				},
				individual: {
					email: session.user.email,
					first_name: user.firstName,
					last_name: user.lastName,
					dob: {
						day: +day,
						month: +month,
						year: +year
					}
				}
			})
			console.log('account', account)
			const res = await safeDBCall(
				db.teacher.update({
					where: {
						id: user.id
					},
					data: {
						stripeAccountId: account.id
					}
				})
			)
			if (!res.ok) {
				await stripe.accounts.del(account.id)
				return {
					type: 'error',
					text: 'Could not create account. Please try again later.'
				} satisfies ServerMessage
			}

			cookies.set('account-id', account.id, { path: '/' })

			const accountLink = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: route('GET /dashboard/profile/account/reauth', { lang }),
				return_url: route('/dashboard/profile/account', { lang }),
				type: 'account_onboarding'
			})

			console.log('accountLink', accountLink)
			accountLinkUrl = accountLink.url
		} catch (e) {
			return {
				type: 'error',
				text: 'Could not create account. Please try again later.'
			} satisfies ServerMessage
		}

		throw redirect(302, accountLinkUrl)
	}
}
