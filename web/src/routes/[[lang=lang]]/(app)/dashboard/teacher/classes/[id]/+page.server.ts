import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, lang, db }, params }) {
	if (!session) throw redirect(302, route('/signin', { lang }))
	const res = await safeDBCall(
		db.class.findUnique({
			where: {
				id: params.id
			},
			include: {
				timeSlot: true,
				students: {
					include: {
						profile: true
					}
				}
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		throw redirect(302, route('/dashboard/teacher/classes', { lang }))
	}
	console.log(res.value)
	return {
		class: res.value
	}
}
