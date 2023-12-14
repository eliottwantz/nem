import { stripe } from '$lib/server/stripe'
import { fail, redirect } from '@sveltejs/kit'
import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import type { ServerMessage } from '$lib/schemas/error'
import { superValidate } from 'sveltekit-superforms/server'
import { cashOutSchema } from './cashOutFormSchema'

export const load = async ({ cookies, locals: { session, user, lang, db } }) => {
	cookies.delete('account-id', { path: '/' })
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	const form = await superValidate<typeof cashOutSchema>(cashOutSchema)
	if (user.role === 'student') return { form }

	const res = await safeDBCall(
		db.teacher.findUnique({
			where: { id: user.id },
			select: {
				cashBank: true,
				stripeAccount: true
			}
		})
	)
	if (!res.ok) throw redirect(302, route('/dashboard/profile', { lang }))

	const { stripeAccount } = res.value
	return {
		form,
		teacher: res.value,
		stripeSetupDone:
			stripeAccount !== null &&
			stripeAccount.chargesEnabled &&
			stripeAccount.detailsSubmitted &&
			stripeAccount.transfersEnabled
	}
}

export const actions = {
	createAccount: async ({ locals: { session, user, db, lang }, cookies, url }) => {
		if (!session || !user) throw redirect(302, route('/signin'))
		const stripeAccount = await safeDBCall(
			db.stripeAccount.findUnique({
				where: { teacherId: user.id }
			})
		)
		if (stripeAccount.ok) {
			return fail(400, {
				text: 'Account already created',
				type: 'error'
			} satisfies ServerMessage)
		}

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
				capabilities: {
					transfers: { requested: true }
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
				},
				business_profile: {
					name: user.firstName + ' ' + user.lastName,
					product_description: 'Teaching services',
					support_email: session.user.email,
					url: 'https://passnem.com'
				},
				settings: {
					payouts: {
						schedule: {
							interval: 'manual'
						}
					}
				}
				// tos_acceptance: {
				// 	service_agreement: 'recipient'
				// }
			})
			console.log('account', account)
			const res = await safeDBCall(
				db.stripeAccount.create({
					data: {
						id: account.id,
						teacherId: user.id
					}
				})
			)
			if (!res.ok) {
				console.log(res.error)
				await stripe.accounts.del(account.id)
				return fail(500, {
					type: 'error',
					text: 'Could not create account. Please try again later.'
				} satisfies ServerMessage)
			}

			cookies.set('account-id', account.id, { path: '/' })

			const accountLink = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: url.origin + route('GET /dashboard/profile/account/reauth', { lang }),
				return_url: url.origin + route('/dashboard/profile/account', { lang }),
				type: 'account_onboarding',
				collect: 'eventually_due'
			})

			console.log('accountLink', accountLink)
			accountLinkUrl = accountLink.url
		} catch (e) {
			return fail(500, {
				type: 'error',
				text: 'Could not create account. Please try again later.'
			} satisfies ServerMessage)
		}

		throw redirect(301, accountLinkUrl)
	},

	finishSetup: async ({ locals: { session, user, db, lang }, url }) => {
		if (!session || !user) throw redirect(302, route('/signin', { lang }))
		const account = await safeDBCall(
			db.stripeAccount.findUnique({
				where: { teacherId: user.id }
			})
		)
		if (!account.ok) throw redirect(302, route('/dashboard/profile/account', { lang }))
		const accountLink = await stripe.accountLinks.create({
			account: account.value.id,
			refresh_url: url.origin + route('GET /dashboard/profile/account/reauth', { lang }),
			return_url: url.origin + route('/dashboard/profile/account', { lang }),
			type: 'account_onboarding',
			collect: 'eventually_due'
		})
		throw redirect(301, accountLink.url)
	},

	cashOut: async ({ request, locals: { session, user, lang, db } }) => {
		if (!session || !user) throw redirect(302, route('/signin', { lang }))
		const form = await superValidate(request, cashOutSchema)
		console.log('POST', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		let expressDashboardUrl = ''
		try {
			const teacher = await safeDBCall(
				db.stripeAccount.findUnique({
					where: { teacherId: user.id },
					select: { id: true }
				})
			)
			if (!teacher.ok) {
				return fail(500, { text: 'Error processing cash out', type: 'error', form })
			}

			const loginLink = await stripe.accounts.createLoginLink(teacher.value.id)
			expressDashboardUrl = loginLink.url
		} catch (e) {
			console.log(e)
			return fail(500, {
				text: 'Error processing cash out',
				type: 'error',
				form
			})
		}

		if (!expressDashboardUrl) {
			return fail(500, { text: 'Error processing cash out', type: 'error', form })
		}

		throw redirect(302, expressDashboardUrl)
	}
}
