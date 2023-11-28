import type { APIErrorJson } from '$lib/api'
import { AppError, safeDBCall } from '$lib/utils/error'
import type { Class } from '@prisma/client'
import { json } from '@sveltejs/kit'

export type JoinClassRequest = {
	userId: string
	name: string
	isPrivate: boolean
	isTrial: boolean
	language: string
	topic: string
	timeSlotId: string
}

export async function POST({ locals: { session, user, db }, request }) {
	if (!session || !user)
		return json({ message: 'Unauthorized' } satisfies APIErrorJson, { status: 401 })
	const req = (await request.json()) as JoinClassRequest

	const res = await safeDBCall(
		db.$transaction(async (tx) => {
			const timeSlot = await tx.timeSlot.findUnique({ where: { id: req.timeSlotId } })
			if (!timeSlot) throw new AppError('Time slot not found: ' + req.timeSlotId, 404)
			let exists = await tx.class.findFirst({
				where: { timeSlotId: req.timeSlotId },
				include: { students: { select: { id: true } } }
			})
			let classs: Class
			if (exists) {
				classs = { ...exists }
				if (exists.isPrivate) {
					throw new AppError(`Class ${exists.id} is private`, 403)
				}
				// Add user to this class if there if less than 4 students in the class and not private
				if (exists.students.length >= 4) throw new AppError('Class is full', 403)
				// Add user to this class
				await tx.class.update({
					where: { id: exists.id },
					data: { students: { connect: { id: user.id } } }
				})
			} else {
				classs = await tx.class.create({
					data: {
						timeSlotId: req.timeSlotId,
						name: req.name,
						isPrivate: req.isPrivate,
						isTrial: req.isTrial,
						language: req.language,
						topic: req.topic,
						students: { connect: { id: user.id } },
						teacherId: timeSlot.teacherId
					}
				})
			}
			// Remove one hour from the hours bank
			await tx.hoursBank.update({
				where: {
					studenId_teacherId: {
						studenId: user.id,
						teacherId: timeSlot.teacherId
					}
				},
				data: { hours: { decrement: 1 } }
			})

			return classs
		})
	)
	if (!res.ok)
		return json(
			{
				message: res.error instanceof AppError ? res.error.message : 'Internal Server Error'
			} satisfies APIErrorJson,
			{ status: 500 }
		)
	return json(res.value)
}
