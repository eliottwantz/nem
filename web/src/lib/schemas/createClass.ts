import { z } from 'zod'

export const createClassSchema = z.object({
	name: z.string().nonempty({ message: 'Class name is required' }),
	userIDs: z.string().array().min(1, { message: 'At least one user is required' }),
	learnId: z.string().nonempty({ message: 'Learn ID is required' }),
	startAt: z.string().nonempty({ message: 'Start time is required' })
})
