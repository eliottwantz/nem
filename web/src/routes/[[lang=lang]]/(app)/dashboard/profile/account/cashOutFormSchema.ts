import { z } from 'zod'

export const cashOutSchema = z.object({
	amount: z
		.number({
			required_error: 'Amount is required',
			invalid_type_error: 'Amount must be a number'
		})
		.min(10, 'Amount must be greater than or equal to 10')
})
