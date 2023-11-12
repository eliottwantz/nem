import type { ServerMessage } from '$lib/schemas/error'
import { createStudentSchema } from '$lib/schemas/profile'
import { safeDBCall } from '$lib/utils/error'
import { fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user, redirect } }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, '/')
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	const form = await superValidate(createStudentSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals: { session, db, redirect, locale } }) => {
		if (!session) throw redirect(302, '/signin')
		const form = await superValidate<typeof createStudentSchema, ServerMessage>(
			request,
			createStudentSchema
		)
		console.log('POST setup-profile', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		const res = await safeDBCall(
			db.$transaction(async (tx) => {
				await tx.profile.create({
					data: {
						id: session.user.id,
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						role: 'student',
						preferedLanguage: locale
					}
				})
				await tx.student.create({ data: { id: session.user.id } })
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return message(form, { type: 'error', text: res.error.message })
		}

		throw redirect(302, '/dashboard/profile')
	}
}
