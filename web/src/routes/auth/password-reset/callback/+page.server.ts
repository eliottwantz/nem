import { fail, redirect } from '@sveltejs/kit'
import { resetPasswordSchema } from '$lib/schemas/newPasswordSchema'
import { message, superValidate } from 'sveltekit-superforms/server'
import type { ServerMessage } from '$lib/schemas/error'
import { AuthApiError } from '@supabase/supabase-js'

export async function load({ url, locals: { supabase } }) {
	const code = url.searchParams.get('code')
	if (!code) {
		throw redirect(302, '/auth/password-reset?state=invalid-code')
	}
	try {
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		if (error) {
			console.log(error)
			throw redirect(302, '/auth/password-reset?state=invalid-code')
		}
	} catch (error) {
		throw redirect(302, '/auth/password-reset?state=invalid-code')
	}

	const form = await superValidate(resetPasswordSchema)
	return { form }
}

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const form = await superValidate<typeof resetPasswordSchema, ServerMessage>(
			request,
			resetPasswordSchema
		)
		if (!form.valid) return fail(400, { form })

		const handleError = (error: unknown) => {
			console.log(error)
			if (error instanceof AuthApiError) {
				if (error.status !== 422)
					return message(form, {
						type: 'error',
						text: error.message
					})
			} else {
				return message(form, { type: 'error', text: 'An unknown error occurred' })
			}
		}
		const { error } = await supabase.auth.updateUser({ password: form.data.password })
		if (error) {
			return handleError(error)
		} else {
			throw redirect(302, '/dashboard/profile')
		}
	}
}
