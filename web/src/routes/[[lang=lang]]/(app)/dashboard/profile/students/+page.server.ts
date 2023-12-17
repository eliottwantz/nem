import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { session, user, db, lang } }) => {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	if (user.role !== 'teacher') throw redirect(302, route('/dashboard/profile', { lang }))

	const res = await safeDBCall(
		db.student.findMany({
			where: {
				classes: {
					some: {
						teacherId: user.id
					}
				}
			},
			select: {
				classes: {
					where: {
						teacherId: user.id,
						timeSlot: {
							startAt: {
								gte: new Date()
							}
						}
					},
					include: { timeSlot: true }
				},
				profile: true,
				subscriptions: {
					where: { teacherId: user.id },
					select: {
						subscription: true
					}
				}
			}
		})
	)
	if (!res.ok) console.log(res.error)
	return {
		studentsInfo: res.ok ? res.value : []
	}
}
