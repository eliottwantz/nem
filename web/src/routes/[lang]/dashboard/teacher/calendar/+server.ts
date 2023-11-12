import { fetchers, safeFetch } from '$lib/api'
import type { TimesRequest } from '$lib/api/api.gen'
import { createAvailabilitySchema, type CreateCalendarAvailability } from '$lib/schemas/calendar'
import { issuesToString } from '$lib/utils/zodError'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals: { session, redirect }, fetch }) => {
	if (!session) throw redirect(302, '/signin')
	try {
		const body = (await request.json()) as CreateCalendarAvailability
		console.log('POST ' + request.url, body)

		const parseRes = await createAvailabilitySchema.safeParseAsync(body)

		if (!parseRes.success) {
			console.log(parseRes.error)
			return new Response(
				JSON.stringify({
					success: false,
					message: issuesToString(parseRes.error.issues)
				}),
				{
					status: 400
				}
			)
		}

		console.log(`FROM ${body.startAt} to ${body.endAt}`)

		let currentStartDate = new Date(body.startAt)
		let currentEndDate = new Date(body.startAt)

		const [startHour] = body.startAt.split('T')[1].split(':').map(Number)
		const [endHour] = body.endAt.split('T')[1].split(':').map(Number)
		let numBlocks = endHour < startHour ? endHour + 24 - startHour : endHour - startHour
		if (numBlocks === 0 && body.startAt.split('T')[0] !== body.endAt.split('T')[0]) {
			numBlocks = 24
		}
		console.log('numBlocks', numBlocks)

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
			fetchers.teacherService(fetch, session).addAvailability({
				req: {
					startAt: body.startAt,
					endAt: body.endAt,
					times
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
