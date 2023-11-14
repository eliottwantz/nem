import type { ServerMessage } from '$lib/schemas/error'
import { createTeacherSchema } from '$lib/schemas/profile'
import { safeDBCall } from '$lib/utils/error'
import { fail } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user, db, redirect } }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, '/')
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	const form = await superValidate(createTeacherSchema)

	const streams = await Promise.all([
		safeDBCall(db.spokenLanguage.findMany()),
		safeDBCall(db.topic.findMany())
	])

	return {
		form,
		languages: streams[0].ok ? streams[0].value : [],
		topics: streams[1].ok ? streams[1].value.map((t) => t.topic) : []
	}
}

export const actions = {
	default: async ({ request, locals: { session, db, locale, redirect } }) => {
		if (!session) throw redirect(302, '/signin')
		const form = await superValidate<typeof createTeacherSchema, ServerMessage>(
			request,
			createTeacherSchema
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
						role: 'teacher',
						preferedLanguage: locale
					}
				})
				await tx.teacher.create({
					data: {
						id: session.user.id,
						bio: form.data.bio,
						hourRate: form.data.hourRate,
						topics: {
							connect: form.data.topicsTaught.map((t) => ({ topic: t }))
						}
						// spokenLanguages: {
						// 	connect: form.data.spokenLanguages.map((s) => ({
						// 		languageId: s.language,
						// 		proficiency: s.proficiency
						// 	}))
						// }
					}
				})
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return message(form, { type: 'error', text: res.error.message })
		}

		throw redirect(302, '/dashboard/profile')
	}
}
