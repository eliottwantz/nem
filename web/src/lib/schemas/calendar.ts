import { z } from 'zod'

export const createAvailabilitySchema = z.object({
	// day: z.string().regex(/\d{4}-\d{2}-\d{2}/, { message: 'Invalid date' }),
	// startTime: z.string().regex(/\d{2}:\d{2}/, { message: 'Invalid time' }),
	// endTime: z.string().regex(/\d{2}:\d{2}/, { message: 'Invalid time' })
	startAt: z.string().datetime({ message: 'Invalid start date' }),
	endAt: z.string().datetime({ message: 'Invalid end date' })
})

export type CreateCalendarAvailability = z.infer<typeof createAvailabilitySchema>

export const modifyAvailabilitySchema = z.object({
	id: z.string().min(1, { message: 'Invalid calendar event id' }),
	startAt: z.string().datetime({ message: 'Invalid start date' }),
	endAt: z.string().datetime({ message: 'Invalid end date' })
})

export type UpdateCalendarAvailability = z.infer<typeof modifyAvailabilitySchema>

export const deleteAvailabilitySchema = z.object({
	id: z.string().min(1, { message: 'Invalid calendar event id' })
})

export type DeleteCalendarAvailability = z.infer<typeof deleteAvailabilitySchema>
