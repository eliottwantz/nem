import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import type { Class, Profile, Teacher, TimeSlot } from '@prisma/client'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, user, lang, db } }) {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	const res = await safeDBCall(
		db.class.findMany({
			where: {
				students: {
					some: {
						id: user.id
					}
				}
			},
			include: {
				timeSlot: true,
				teacher: {
					include: {
						profile: true
					}
				}
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return {
			classes: [] as (Class & {
				timeSlot: TimeSlot
				teacher: Teacher & { profile: Profile }
			})[]
		}
	}

	return {
		classes: res.value
	}
}
