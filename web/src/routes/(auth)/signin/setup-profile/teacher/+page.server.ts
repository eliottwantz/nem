import { safeFetch, fetchers } from '$lib/api'
import type { ServerMessage } from '$lib/schemas/error'
import { createTeacherSchema } from '$lib/schemas/profile'
import { fail, json, redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user }, fetch }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, '/')
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	const streams = await Promise.all([
		safeFetch(fetchers.classService(fetch, session).listLanguages()),
		safeFetch(fetchers.classService(fetch, session).listTopics())
	])

	const form = await superValidate(createTeacherSchema)
	form.data.role = 'teacher'

	return {
		form,
		languages: streams[0].ok ? streams[0].data.languages : [],
		topics: streams[1].ok ? streams[1].data.topics : []
	}
}

export const actions = {
	default: async ({ request, fetch, locals: { session } }) => {
		if (!session) throw redirect(302, '/signin')
		debugger
		const form = await superValidate<typeof createTeacherSchema, ServerMessage>(
			request,
			createTeacherSchema
		)
		console.log('POST setup-profile', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		if (form.data.spokenLanguages.length === 0) {
			return message(form, { type: 'error', text: 'Please select your spoken languages' })
		}

		const res = await safeFetch(
			fetchers.userService(fetch, session).createTeacher({
				req: {
					firstName: form.data.firstName,
					lastName: form.data.lastName,
					email: session.user.email!,
					role: form.data.role,
					preferedLanguage: form.data.preferedLanguage,
					bio: form.data.bio,
					hourRate: form.data.hourRate,
					spokenLanguages: form.data.spokenLanguages,
					topicsTaught: form.data.topicsTaught
				}
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return message(form, { type: 'error', text: res.cause })
		}

		throw redirect(302, '/dashboard/profile')
	}
}
