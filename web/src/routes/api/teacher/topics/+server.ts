import { safeDBCall } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export const PATCH = async ({ locals: { session, user, db }, request }) => {
	if (!session || !user) return new Response('Unauthorized', { status: 401 })
	try {
		const req = (await request.json()) as string[]
		const res = await safeDBCall(
			db.teacher.update({
				where: { id: user.id },
				data: { topics: { disconnect: req.map((t) => ({ topic: t })) } }
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return json({ message: 'Could not update topics teaching list' }, { status: 400 })
		} else return json({ message: 'Updated topics teaching list' }, { status: 200 })
	} catch (e) {
		console.log(e)
		return json({ message: 'Could not update topics teaching list' }, { status: 500 })
	}
}
