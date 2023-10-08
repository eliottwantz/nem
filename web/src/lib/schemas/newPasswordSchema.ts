import { z } from 'zod'

export const newPasswordSchema = z.object({
	password: z
		.string()
		.nonempty({ message: 'Password is required' })
		.refine((value) => (value ? value.length >= 8 : true), {
			message: 'Password must be at least 8 characters long'
		})
		.refine((value) => (value ? value.length <= 128 : true), {
			message: 'Password must be at most 128 characters long'
		})
})
