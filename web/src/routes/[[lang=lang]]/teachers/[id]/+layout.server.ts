import { AppError, dbLoadPromise, safeDBCall } from '$lib/utils/error'
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
			chat: new Promise<(Chat | null) | Error>(async (resolve) => {
				const res = await safeDBCall(
					db.chat.findFirst({
						where: {
							users: {
								some: {
									id: {
										in: [user.id, params.id]
									}
								}
							}
						}
					})
				)
				if (res.ok) resolve(res.value)
				else if (res.error instanceof AppError) resolve(null)
				else {
					console.log(res.error)
					resolve(null)
				}
				// if (res.ok) resolve(res.value)
				// else if (res.error instanceof AppError) {
				// 	// If the error is that the chat was not found, then create it
				// 	const res = await safeDBCall(
				// 		db.chat.create({
				// 			data: {
				// 				users: {
				// 					connect: [
				// 						{
				// 							id: user.id
				// 						},
				// 						{
				// 							id: params.id
				// 						}
				// 					]
				// 				}
				// 			}
				// 		})
				// 	)
				// 	if (res.ok) resolve(res.value)
				// 	else {
				// 		console.log(res.error)
				// 		resolve(null)
				// 	}
				// } else {
				// 	console.log(res.error)
				// 	resolve(null)
				// }
			}),
			availabilities: dbLoadPromise(
				safeDBCall(
					db.$transaction(async (tx) => {
						// List all timeSlots for the teacher where there is not private class, or not class with 4 students already, and the timeslot is not in the past.
						const timeSlots = await tx.timeSlot.findMany({
							include: {
								class: {
									include: {
										_count: { select: { students: true } },
										students: {
											select: {
												id: true
											}
										}
									}
								}
							},
							where: {
								teacherId: { equals: params.id },
								class: {
									isPrivate: { not: true }
								},
								startAt: { lt: new Date() }
							}
						})
						return timeSlots.filter((t) => {
							if (t.class && t.class._count.students >= 4) return false
							if (t.class?.students.map((s) => s.id).includes(user.id)) return false
							return true
						})
					})
				),
				[]
			),
			classes: dbLoadPromise(
				safeDBCall(
					db.class.findMany({
						where: { teacherId: { equals: params.id } },
						include: { timeSlot: true }
					})
				),
				[]
			)
		}
	}
}
