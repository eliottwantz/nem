import { fetchers, safeFetch } from '$lib/api'
import type { ServerMessage } from '$lib/schemas/error'
import { teachNewTopicSchema } from '$lib/schemas/teach'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'

export async function load({ locals: { session, user }, fetch }) {
	if (!session || !user) throw redirect(302, '/login')
	const streams = await Promise.all([
		safeFetch(fetchers.classService(fetch, session).listTopics()),
		safeFetch(fetchers.teacherService(fetch, session).findTeacherByID({ id: user.id }))
	])

	const form = await superValidate(teachNewTopicSchema)

	return {
		form,
		topics: streams[0].ok ? streams[0].data.topics : [],
		topicsTaught: streams[1].ok ? streams[1].data.teacher.topicsTaught : []
	}
}

export const actions = {
	async default({ request, locals: { session }, fetch }) {
		if (!session) throw redirect(302, '/login')
		debugger
		const form = await superValidate<typeof teachNewTopicSchema, ServerMessage>(
			request,
			teachNewTopicSchema
		)
		if (!form.valid) return fail(400, { form })

		const res = await safeFetch(
			fetchers.teacherService(fetch, session).teach({
				topic: form.data.topic
			})
		)

		if (!res.ok) {
			console.log(res.error)
			return fail(res.error.code, {
				success: false,
				message: res.cause
			})
		}
	}
}
