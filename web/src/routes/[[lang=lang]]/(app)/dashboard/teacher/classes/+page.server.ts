import { safeDBCall } from '$lib/utils/error'
import type { Class, TimeSlot } from '@prisma/client'

export async function load({ locals: { session, user, redirect, db } }) {
	if (!session || !user) throw redirect(302, '/signin')
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
