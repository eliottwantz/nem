import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, lang, db } }) {
	if (!session) throw redirect(302, route('/signin', { lang }))

	const data = await Promise.all([
		safeDBCall(
			db.class.findMany({
				include: { timeSlot: true },
				where: { teacherId: session.user.id }
			})
		),
		safeDBCall(
			db.timeSlot.findMany({
				where: { teacherId: session.user.id }
			})
		)
	])
	let message = ''
	if (!data[0].ok) message = 'Failed to load classes'
	if (!data[1].ok) message = 'Failed to load availabilities'
	return {
		success: data[0].ok && data[1].ok,
		message,
		classes: data[0].ok ? data[0].value : [],
		availabilities: data[1].ok ? data[1].value : []
	}
}
