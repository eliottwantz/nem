import type { ServerMessage } from '$lib/schemas/error'
import { teachNewTopicSchema } from '$lib/schemas/teach'
import { safeDBCall } from '$lib/utils/error'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'

export async function load({ locals: { session, user, redirect, db } }) {
	if (!session || !user) throw redirect(302, '/signin')
	const data = await Promise.all([
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
		topics: data[0].ok ? data[0].value.map((t) => t.topic) : [],
		topicsTaught: data[1].ok ? data[1].value.topics.map((t) => t.topic) : []
	}
}

export const actions = {
	newTopic: async ({ request, locals: { session, redirect, db } }) => {
		if (!session) throw redirect(302, '/signin')
		const form = await superValidate<typeof teachNewTopicSchema, ServerMessage>(
			request,
			teachNewTopicSchema
		)
		if (!form.valid) return fail(400, { form })

		const res = await safeDBCall(
			db.teacher.update({
				where: { id: session.user.id },
				data: { topics: { connect: { topic: form.data.topic } } }
			})
		)

		if (!res.ok) {
			console.log(res.error)
			return fail(400, {
				success: false,
				message: 'Could not add this topic to your teaching list. Please try again.'
			})
		}
	}
}
