import { safeDBCall } from '$lib/utils/error'

export async function load({ locals: { session, redirect, db } }) {
	if (!session) throw redirect(302, '/signin')

	// const res = await safeFetch(fetchers.studentService(fetch, session).listClasses())
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
