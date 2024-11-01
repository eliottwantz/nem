import { route } from '$lib/ROUTES'
import { createAvailabilitySchema, type CreateCalendarAvailability } from '$lib/schemas/calendar'
import { safeDBCall } from '$lib/utils/error'
import { issuesToString } from '$lib/utils/zodError'
import { redirect } from '@sveltejs/kit'

export interface TimesRequest {
	startAt: string
	endAt: string
}

export const POST = async ({ request, locals: { session, lang, db } }) => {
	if (!session) throw redirect(302, route('/signin', { lang }))
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

		const res = await safeDBCall(
			db.$transaction(async (tx) => {
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
					message: 'Failed to create availabilities'
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
