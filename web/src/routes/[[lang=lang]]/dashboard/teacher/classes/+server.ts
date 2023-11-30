import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { fetchers, safeFetch } from '$lib/api'
import { sendClassCanceledEmail } from '$lib/server/email/email'
import type { Class } from '$lib/api/api.gen'

export const DELETE: RequestHandler = async ({ locals: { session }, request }) => {
	if (!session) throw error(401, 'Unauthorized')

	try {
		const req: Class = await request.json()
		const res = await safeFetch(
			fetchers.teacherService(fetch, session).cancelClass({
				classId: req.id
			})
		)
		if (!res.ok) {
			console.log(res.error)
			throw error(res.error.status, res.cause)
		}

		// Send email to all users in class sayiing it got canceled
		for (const user of res.data.usersInClass) {
			await sendClassCanceledEmail(req, res.data.teacher, user.email)
		}

		return new Response()
	} catch (e) {
		throw error(500, e instanceof Error ? e.message : 'Something went wrong')
	}
}
