import { safeFetch, fetchers } from '$lib/api'
import type { TimesRequest } from '$lib/api/api.gen'
import {
	type UpdateCalendarAvailability,
	modifyAvailabilitySchema,
	type DeleteCalendarAvailability,
	deleteAvailabilitySchema
} from '$lib/schemas/calendar'
import { issuesToString } from '$lib/utils/zodError'
import { type RequestHandler, redirect } from '@sveltejs/kit'

export const PUT: RequestHandler = async ({ request, locals: { session }, fetch }) => {
	if (!session) throw redirect(302, '/login')
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

		const res = await safeFetch(
			fetchers.teacherService(fetch, session).updateAvailability({
				req: {
					id: parseRes.data.id,
					times,
					startAt: body.startAt,
					endAt: body.endAt
				}
			})
		)
		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					message: res.cause
				})
			)
		}

		return new Response(
			JSON.stringify({
				success: true,
				timeSlots: res.data.timeSlots
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

export const DELETE: RequestHandler = async ({ request, locals: { session }, fetch }) => {
	if (!session) throw redirect(302, '/login')
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

		const res = await safeFetch(
			fetchers.teacherService(fetch, session).deleteAvailability({
				id: parseRes.data.id
			})
		)
		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					message: res.cause
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
