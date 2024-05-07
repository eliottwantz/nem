import { sendClassCanceledEmail } from '$lib/server/email/email'
import { AppError, safeDBCall } from '$lib/utils/error'

export const DELETE = async ({ locals: { session, user, db, message }, params }) => {
	if (!session || !user) return message({ type: 'error', text: 'Unauthorized' }, { status: 401 })

	const res = await safeDBCall(
		db.$transaction(async (tx) => {
			const dbClass = await tx.class.findUnique({
				where: { id: params.id },
				include: {
					students: {
						select: {
							id: true,
							profile: {
								select: {
									user: {
										select: { email: true }
									}
								}
							}
						}
					},
					timeSlot: true,
					teacher: { select: { profile: true } }
				}
			})
			if (!dbClass) throw new AppError('Class not found', 404)
			if (dbClass.teacherId !== user.id) throw new AppError('Unauthorized', 401)
			// Remove all students from class
			await tx.class.update({
				where: { id: params.id },
				data: {
					students: {
						disconnect: dbClass.students.map((s) => ({ id: s.id }))
					}
				}
			})
			return dbClass
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return res.error instanceof AppError
			? message({ type: 'error', text: res.error.message }, { status: res.error.status })
			: message({ type: 'error', text: 'Something went wrong' }, { status: 500 })
	}

	// Send email to all users in class sayiing it got canceled
	for (const user of res.value.students) {
		await sendClassCanceledEmail(res.value, res.value.teacher.profile, user.profile.user.email)
	}

	// Delete class
	const deleted = await safeDBCall(
		db.class.delete({
			where: { id: params.id }
		})
	)
	if (!deleted.ok) {
		console.log('Failed to delete class:\n', deleted.error)
		return message({ type: 'error', text: 'Something went wrong' }, { status: 500 })
	}

	return message({ type: 'success', text: 'Class canceled' }, { status: 200 })
}
