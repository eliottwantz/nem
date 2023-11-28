import { dbLoadPromise, safeDBCall } from '$lib/utils/error'
import type { Chat, Subscription } from '@prisma/client'
import { error } from '@sveltejs/kit'

export async function load({ params, locals: { session, user, redirect, db } }) {
	if (!session || !user) throw redirect(302, '/signin')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')

	const teacher = await safeDBCall(
		db.teacher.findUnique({
			include: { topics: true, profile: true, spokenLanguages: true, reviews: true },
			where: { id: params.id }
		})
	)
	if (!teacher.ok) {
		console.log(teacher.error)
		throw error(404, 'Teacher not found')
	}
	return {
		user,
		teacher: teacher.value,
		isFirstClass: dbLoadPromise(
			safeDBCall(
				db.studentSubscription
					.count({
						where: { studentId: user.id, teacherId: params.id }
					})
					.then((count) => count === 0)
			),
			true
		),
		hoursBank: dbLoadPromise(
			safeDBCall(
				db.hoursBank
					.findUnique({
						select: { hours: true },
						where: {
							studenId_teacherId: {
								studenId: user.id,
								teacherId: params.id
							}
						}
					})
					.then((res) => res?.hours)
			),
			0
		),
		streamed: {
			subscriptions: new Promise<Subscription[]>((resolve) => {
				safeDBCall(db.subscription.findMany({}).then((res) => resolve(res)))
			}),
			convo: new Promise<Chat | null>((resolve) => {
				safeDBCall(
					db.chat.findFirst({
						where: {
							users: {
								some: {
									OR: [
										{
											id: { contains: user.id }
										},
										{
											id: { contains: params.id }
										}
									]
								}
							}
						}
					})
				).then((res) => (res.ok ? resolve(res.value) : resolve(null)))
			})
			// availabilities: new Promise<TimeSlot[]>((resolve) => {
			// 	safeFetch(
			// 		fetchers
			// 			.studentService(fetch, session)
			// 			.listAvailabilitiesOfTeacher({ teacherId: params.id })
			// 	).then((res) => {
			// 		if (res.ok) resolve(res.data.timeSlots)
			// 		else resolve([])
			// 	})
			// }),
			// classes: new Promise<Class[]>((resolve) => {
			// 	safeFetch(
			// 		fetchers
			// 			.teacherService(fetch, session)
			// 			.listClassesOfTeacher({ teacherId: params.id })
			// 	).then((res) => {
			// 		if (res.ok) resolve(res.data.classes)
			// 		else resolve([])
			// 	})
			// })
		}
	}
}
