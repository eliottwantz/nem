import { fetchers, safeFetch } from '$lib/api'
import type { ServerMessage } from '$lib/schemas/error'
import { teachNewTopicSchema } from '$lib/schemas/teach'
import { safeDBCall } from '$lib/utils/error'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'

export async function load({ locals: { session, user, redirect, db }, fetch }) {
	if (!session || !user) throw redirect(302, '/signin')
	const streams = await Promise.all([
		safeDBCall(db.topic.findMany()),
		safeDBCall(
			db.teacher.findUnique({
				select: {
					topics: true
				},
				where: { id: user.id }
			})
		)
	])

	const form = await superValidate(teachNewTopicSchema)

	return {
		form,
		topics: streams[0].ok ? streams[0].value.map((t) => t.topic) : [],
		topicsTaught: streams[1].ok ? streams[1].value.topics.map((t) => t.topic) : []
	}
}

export const actions = {
	async default({ request, locals: { session, redirect }, fetch }) {
		if (!session) throw redirect(302, '/signin')
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
