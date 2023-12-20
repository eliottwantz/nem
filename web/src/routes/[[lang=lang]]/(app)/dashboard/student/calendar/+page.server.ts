import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, lang, db } }) {
	if (!session) throw redirect(302, route('/signin', { lang }))

	const res = await safeDBCall(
		db.class.findMany({
			where: {
				students: {
					some: {
						id: session.user.id
					}
				}
			},
			include: {
				timeSlot: true
			}
		})
	)

	return {
		success: res.ok,
		classes: res.ok ? res.value : []
	}
}
