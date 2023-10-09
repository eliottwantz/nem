import { z } from 'zod'

export const registerSchema = z.object({
	email: z.string().email({ message: 'Invalid email' }),
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
