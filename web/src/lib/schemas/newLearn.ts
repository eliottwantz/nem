import { z } from 'zod'

export const newLearnSchema = z.object({
	language: z.string().nonempty({ message: 'Language is required' }),
	topic: z.string().nonempty({ message: 'Topic is required' })
})
