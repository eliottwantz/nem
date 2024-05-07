import { route } from '$lib/ROUTES'
import { AppError, dbLoadPromise, safeDBCall } from '$lib/utils/error'
import type { Chat, StudentSubscription, Subscription } from '@prisma/client'
import { error, redirect } from '@sveltejs/kit'

export async function load({ params, locals: { session, user, lang, db } }) {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	if (user.role === 'teacher' && params.id !== user.id) {
		throw redirect(302, route('/dashboard/teacher/classes', { lang }))
	}

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
	const res = await safeDBCall(
		db.student.findFirst({
			where: {
				id: user.id,
				classes: {
					every: { teacherId: params.id }
				}
			},
			select: { classes: true }
		})
	)
	console.log('RES', res)
	let isFirstClass = true
	if (!res.ok) {
		const traceId = crypto.randomUUID()
		console.log('[trace id]', traceId, res.error)
		if (res.error instanceof AppError) {
			isFirstClass = true
		} else {
			throw error(500, '[trace id = ' + traceId + '] Something went wrong')
		}
	} else {
		console.log('isFirstClass', isFirstClass)
		if (res.value.classes.length > 0) {
			isFirstClass = false
		}
	}
	console.log('isFirstClass', isFirstClass)
	let subscription: StudentSubscription | null = null
	const sub = await safeDBCall(
		db.studentSubscription.findUnique({
			where: {
				studentId_teacherId: {
					studentId: user.id,
					teacherId: params.id
				}
			}
		})
	)
	if (!sub.ok) {
		if (sub.error instanceof AppError) {
		} else {
			const traceId = crypto.randomUUID()
			console.log(sub.error, '[trace id]', traceId)
			throw error(500, '[trace id = ' + traceId + '] Something went wrong')
		}
	} else {
		isFirstClass = false
		subscription = sub.value
	}
	console.log('isFirstClass', isFirstClass)

	return {
		user,
		teacher: teacher.value,
		isFirstClass,
		subscription,
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
			availabilities: dbLoadPromise(
				safeDBCall(
					db.$transaction(async (tx) => {
						// List all timeSlots for the teacher where there is not private class, or not class with 4 students already, and the timeslot is not in the past.
						const timeSlots = await tx.timeSlot.findMany({
							include: {
								class: {
									include: {
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
								startAt: { gt: new Date() }
							}
						})
						return timeSlots.filter((t) => {
							if (!t.class) return true
							if (isFirstClass) return false
							if (t.class.isPrivate) return false
							if (t.class.students.length >= 4) return false
							if (t.class.students.map((s) => s.id).includes(user.id)) return false
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
