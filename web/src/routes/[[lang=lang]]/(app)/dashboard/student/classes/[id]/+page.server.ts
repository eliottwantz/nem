import { route } from '$lib/ROUTES'
import { dbLoadPromise, safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, user, lang, db }, params }) {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	const res = await safeDBCall(
		db.class.findUnique({
			where: { id: params.id },
			include: {
				timeSlot: true,
				teacher: {
					select: {
						id: true,
						topAgent: true,
						profile: true
					}
				},
				students: {
					select: {
						id: true,
						profile: true
					}
				}
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		throw redirect(302, '/dashboard/teacher/classes?notFound=' + params.id)
	}
	console.log(res.value)
	return {
		class: res.value,
		hoursBank: dbLoadPromise(
			safeDBCall(
				db.hoursBank
					.findUnique({
						select: { hours: true },
						where: {
							studenId_teacherId: {
								studenId: user.id,
								teacherId: res.value.teacherId
							}
						}
					})
					.then((res) => res?.hours)
			),
			0
		)
	}
}
