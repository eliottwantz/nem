import { z } from 'zod'

export const resetPasswordSchema = z.object({
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

export const newPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.nonempty({ message: 'New Password is required' })
			.refine((value) => (value ? value.length >= 8 : true), {
				message: 'New Password must be at least 8 characters long'
			})
			.refine((value) => (value ? value.length <= 128 : true), {
				message: 'New Password must be at most 128 characters long'
			}),
		newPasswordConfirm: z
			.string()
			.nonempty({ message: 'Password is required' })
			.refine((value) => (value ? value.length >= 8 : true), {
				message: 'Password must be at least 8 characters long'
			})
			.refine((value) => (value ? value.length <= 128 : true), {
				message: 'Password must be at most 128 characters long'
			})
	})
	.superRefine((value, ctx) => {
		if (value.newPassword !== value.newPasswordConfirm) {
			ctx.addIssue({
				code: 'custom',
				message: 'Passwords do not match'
			})
		}
	})
