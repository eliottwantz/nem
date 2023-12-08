import { route } from '$lib/ROUTES'
import {
	deleteAvailabilitySchema,
	modifyAvailabilitySchema,
	type DeleteCalendarAvailability,
	type UpdateCalendarAvailability
} from '$lib/schemas/calendar'
import { safeDBCall } from '$lib/utils/error'
import { issuesToString } from '$lib/utils/zodError'
import { json, redirect } from '@sveltejs/kit'
import type { TimesRequest } from '../+server'

export const PUT = async ({ request, locals: { session, lang, db, message } }) => {
	if (!session) throw redirect(302, route('/signin', { lang }))
	try {
		const body = (await request.json()) as UpdateCalendarAvailability
		console.log('PUT ' + request.url, body)

		const parseRes = await modifyAvailabilitySchema.safeParseAsync(body)

		if (!parseRes.success)
			return message(
				{ type: 'error', text: issuesToString(parseRes.error.issues) },
				{ status: 400 }
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
				return await tx.timeSlot.findMany({
					where: {
						teacherId: session.user.id,
						startAt: { gte: body.startAt },
						endAt: { lte: body.endAt }
					}
				})
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return message(
				{ type: 'error', text: 'Failed to update availabilities' },
				{ status: 500 }
			)
		}

		return json(res.value)
	} catch (e) {
		console.log(e)
		return message(
			{ type: 'error', text: 'Invalid request body: ' + (e as Error).message },
			{ status: 400 }
		)
	}
}

export const DELETE = async ({ request, locals: { session, lang, db, message } }) => {
	if (!session) throw redirect(302, route('/signin', { lang }))
	try {
		const body = (await request.json()) as DeleteCalendarAvailability
		console.log('PUT ' + request.url, body)

		const parseRes = await deleteAvailabilitySchema.safeParseAsync(body)

		if (!parseRes.success)
			return message(
				{
					type: 'error',
					text: issuesToString(parseRes.error.issues)
				},
				{ status: 400 }
			)

		const res = await safeDBCall(db.timeSlot.delete({ where: { id: body.id } }))
		if (!res.ok) {
			return message(
				{
					type: 'error',
					text: 'Failed to delete availability. Maybe it is because you have a class in this time slot'
				},
				{ status: 500 }
			)
		}

		return json({
			success: true
		})
	} catch (error) {
		return message(
			{
				type: 'error',
				text: 'Invalid request body: ' + (error as Error).message
			},
			{ status: 400 }
		)
	}
}
