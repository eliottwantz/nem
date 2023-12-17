import type { ServerMessage } from '$lib/schemas/error'
import { AppError, safeDBCall } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export const POST = async ({ locals: { session, user, db, message }, params }) => {
	if (!session || !user)
		return message(
			{ type: 'error', text: 'Unauthorized' },
			{
				status: 401
			}
		)
	const res = await safeDBCall(
		db.$transaction(async (tx) => {
			const dbClass = await tx.class.findUnique({
				where: { id: params.id },
				include: {
					timeSlot: true,
					students: {
						select: { id: true }
					}
				}
			})
			if (!dbClass) throw new AppError('Class not found', 404)
			if (dbClass.isTrial) throw new AppError('Cannot cancel a trial class', 400)
			// Check if at least 2 hours before class starts
			const isTwoHoursBefore =
				new Date().getTime() < dbClass.timeSlot.startAt.getTime() - 2 * 60 * 60 * 1000
			if (isTwoHoursBefore) {
				// Refund the hour
				await tx.hoursBank.update({
					where: {
						studenId_teacherId: {
							studenId: user.id,
							teacherId: dbClass.teacherId
						}
					},
					data: {
						hours: {
							increment: 1
						}
					}
				})
			}
			// Remove student from class
			await tx.class.update({
				data: {
					students: {
						disconnect: { id: user.id }
					}
				},
				where: {
					id: dbClass.id
				}
			})
			// If there are no more students in the class, delete the class
			if (dbClass.students.length === 1) {
				await tx.class.delete({ where: { id: dbClass.id } })
			}
			return true
		})
	)

	if (!res.ok) {
		return res.error instanceof AppError
			? message({ type: 'error', text: res.error.message } satisfies ServerMessage, {
					status: res.error.status
			  })
			: message({ type: 'error', text: 'Something went wrong' } satisfies ServerMessage, {
					status: 500
			  })
	} else return message({ type: 'success', text: 'Class cancelled' }, { status: 200 })
}
