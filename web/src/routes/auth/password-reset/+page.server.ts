import type { FormErrorMessage } from '$lib/schemas/error'
import { forgotPasswordSchema } from '$lib/schemas/forgotPassword'
import { fail, redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export async function load({ locals: { session } }) {
	if (session) throw redirect(302, '/dashboard/profile')

	const form = await superValidate(forgotPasswordSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals: { supabase }, url }) => {
		const form = await superValidate<typeof forgotPasswordSchema, FormErrorMessage>(
			request,
			forgotPasswordSchema
		)

		if (!form.valid) return fail(400, { form })

		const { error } = await supabase.auth.resetPasswordForEmail(form.data.email, {
			redirectTo: `${url.origin}${url.pathname}/callback`
		})

		if (error) {
			return message(form, { type: 'error', text: 'An unknown error occurred' })
		}

		return message(form, { type: 'success', text: 'Your verification link was resent' })
	}
}
