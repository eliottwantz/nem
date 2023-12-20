import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import type { Class, TimeSlot } from '@prisma/client'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, user, lang, db } }) {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	const res = await safeDBCall(
		db.class.findMany({
			where: { teacherId: user.id },
			include: {
				timeSlot: true
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return {
			classes: [] as (Class & { timeSlot: TimeSlot })[]
		}
	}
	console.log(res.value)
	return {
		classes: res.value
	}
}
