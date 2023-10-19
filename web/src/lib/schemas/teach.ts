import { z } from 'zod'

export const teachNewTopicSchema = z.object({
	topic: z.string().nonempty({ message: 'Topic is required' })
})
