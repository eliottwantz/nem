import { route } from '$lib/ROUTES'
import type { ServerMessage } from '$lib/schemas/error'
import { createTeacherSchema } from '$lib/schemas/profile'
import { stripe } from '$lib/server/stripe'
import { safeDBCall } from '$lib/utils/error'
import { fail, redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user, db, lang } }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, route('/signin', { lang }))
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	const form = await superValidate(createTeacherSchema)

	const streams = await Promise.all([
		safeDBCall(db.language.findMany()),
		safeDBCall(db.topic.findMany())
	])

	return {
		form,
		languages: streams[0].ok ? streams[0].value.map((l) => l.language) : [],
		topics: streams[1].ok ? streams[1].value.map((t) => t.topic) : []
	}
}

export const actions = {
	default: async ({ request, locals: { session, db, lang } }) => {
		if (!session) throw redirect(302, route('/signin', { lang }))
		const form = await superValidate<typeof createTeacherSchema, ServerMessage>(
			request,
			createTeacherSchema
		)
		console.log('POST setup-profile', form.data)

		if (!form.valid) {
			return fail(400, { form })
		}

		const customer = await stripe.customers.create({
			email: session.user.email,
			name: form.data.firstName + ' ' + form.data.lastName,
			preferred_locales: [lang, 'en'],
			metadata: {
				userId: session.user.id,
				role: 'teacher'
			}
		})
		const account = await stripe.accounts.create({
			type: 'express',
			email: session.user.email,
			metadata: {
				userId: session.user.id
			}
		})
		console.log('account', account)
		const accountLink = await stripe.accountLinks.create({
			account: account.id,
			refresh_url: 'http://localhost:5173/stripe/reauth',
			return_url: 'http://localhost:5173/stripe/return',
			type: 'account_onboarding'
		})
		console.log('accountLink', accountLink)

		const res = await safeDBCall(
			db.$transaction(async (tx) => {
				await tx.profile.create({
					data: {
						id: session.user.id,
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						role: 'teacher',
						preferedLanguage: lang,
						birdthday: new Date(form.data.birthday),
						stripeCustomerId: customer.id
					}
				})
				return await tx.teacher.create({
					data: {
						id: session.user.id,
						bio: form.data.bio,
						hourRate: form.data.hourRate,
						topics: {
							connect: form.data.topicsTaught.map((t) => ({ topic: t }))
						},
						spokenLanguages: {
							connectOrCreate: form.data.spokenLanguages.map((l) => ({
								create: {
									languageId: l.language,
									proficiency: l.proficiency
								},
								where: {
									languageId_proficiency: {
										languageId: l.language,
										proficiency: l.proficiency
									}
								}
							}))
						}
					}
				})
			})
		)
		if (!res.ok) {
			console.log(res.error)
			await stripe.customers.del(customer.id)
			return message(form, {
				type: 'error',
				text: 'Something went wrong when creating your profile'
			})
		}

		throw redirect(302, '/dashboard/profile')
	}
}
