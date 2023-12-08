import { route } from '$lib/ROUTES'
import type { ServerMessage } from '$lib/schemas/error'
import { createStudentSchema } from '$lib/schemas/profile'
import { stripe } from '$lib/server/stripe'
import { safeDBCall } from '$lib/utils/error'
import { fail, redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user, lang } }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, route('/signin', { lang }))
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	const form = await superValidate(createStudentSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals: { session, db, lang } }) => {
		if (!session) throw redirect(302, route('/signin', { lang }))
		const form = await superValidate<typeof createStudentSchema, ServerMessage>(
			request,
			createStudentSchema
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
				role: 'student'
			}
		})
		const res = await safeDBCall(
			db.$transaction(async (tx) => {
				await tx.profile.create({
					data: {
						id: session.user.id,
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						role: 'student',
						preferedLanguage: lang,
						birdthday: new Date(form.data.birthday),
						stripeCustomerId: customer.id
					}
				})
				return await tx.student.create({ data: { id: session.user.id } })
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
