import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { session, user, lang, db } }) => {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	if (user.role !== 'student') throw redirect(302, route('/dashboard/profile', { lang }))

	const res = await safeDBCall(
		db.studentSubscription.findMany({
			where: {
				studentId: user.id
			},
			select: {
				subscription: true,
				teacher: {
					select: {
						profile: true
					}
				},
				student: {
					select: {
						classes: {
							where: {
								timeSlot: {
									startAt: {
										gte: new Date()
									}
								}
							},
							include: {
								timeSlot: true
							}
						}
					}
				}
			}
		})
	)
	if (!res.ok) console.log(res.error)
	return {
		subscriptions: res.ok ? res.value : []
	}
}
