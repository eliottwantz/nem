import {
	type UpdateCalendarAvailability,
	modifyAvailabilitySchema,
	type DeleteCalendarAvailability,
	deleteAvailabilitySchema
} from '$lib/schemas/calendar'
import { safeDBCall } from '$lib/utils/error'
import { issuesToString } from '$lib/utils/zodError'
import type { TimesRequest } from '../+server'

export const PUT = async ({ request, locals: { session, redirect, db } }) => {
	if (!session) throw redirect(302, '/signin')
	try {
		const body = (await request.json()) as UpdateCalendarAvailability
		console.log('PUT ' + request.url, body)

		const parseRes = await modifyAvailabilitySchema.safeParseAsync(body)

		if (!parseRes.success)
			return new Response(
				JSON.stringify({
					success: false,
					message: issuesToString(parseRes.error.issues)
				}),
				{
					status: 400
				}
			)

		console.log(`UPDATE TIME SLOT: ${body.startAt} - ${body.endAt}`)

		const [startHour] = body.startAt.split('T')[1].split(':').map(Number)
		const [endHour] = body.endAt.split('T')[1].split(':').map(Number)
		let numBlocks = endHour < startHour ? endHour + 24 - startHour : endHour - startHour
		if (numBlocks === 0 && body.startAt.split('T')[0] !== body.endAt.split('T')[0]) {
			numBlocks = 24
		}
		console.log('numBlocks', numBlocks)

		let currentStartDate = new Date(body.startAt)
		let currentEndDate = new Date(body.startAt)
		currentEndDate.setTime(currentStartDate.getTime() + 60 * 60 * 1000)
		const times: TimesRequest[] = []
		for (let i = 0; i < numBlocks; i++) {
			const startAt = currentStartDate.toISOString()
			const endAt = currentEndDate.toISOString()
			times.push({
				startAt,
				endAt
			})
			currentStartDate.setTime(currentStartDate.getTime() + 60 * 60 * 1000)
			currentEndDate.setTime(currentEndDate.getTime() + 60 * 60 * 1000)
		}

		const res = await safeDBCall(
			db.$transaction(async (tx) => {
				// First delete this existing timeslot
				await tx.timeSlot.delete({
					where: { id: body.id }
				})
				await tx.timeSlot.createMany({
					data: times.map((t) => ({
						teacherId: session.user.id,
						startAt: t.startAt,
						endAt: t.endAt
					}))
				})
				return tx.timeSlot.findMany({
					where: {
						teacherId: session.user.id,
						startAt: { gte: body.startAt },
						endAt: { lte: body.endAt }
					}
				})
			})
		)
		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Failed to update availabilities'
				})
			)
		}

		return new Response(
			JSON.stringify({
				success: true,
				timeSlots: res.value
			})
		)
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Invalid request body: ' + (error as Error).message
			})
		)
	}
}

export const DELETE = async ({ request, locals: { session, redirect, db } }) => {
	if (!session) throw redirect(302, '/signin')
	try {
		const body = (await request.json()) as DeleteCalendarAvailability
		console.log('PUT ' + request.url, body)

		const parseRes = await deleteAvailabilitySchema.safeParseAsync(body)

		if (!parseRes.success)
			return new Response(
				JSON.stringify({
					success: false,
					message: issuesToString(parseRes.error.issues)
				}),
				{
					status: 400
				}
			)

		const res = await safeDBCall(db.timeSlot.delete({ where: { id: body.id } }))
		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Failed to delete availability'
				})
			)
		}

		return new Response(
			JSON.stringify({
				success: true
			})
		)
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Invalid request body: ' + (error as Error).message
			})
		)
	}
}
