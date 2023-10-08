import { fail, redirect } from '@sveltejs/kit'
import { newPasswordSchema } from '$lib/schemas/newPasswordSchema'
import { message, superValidate } from 'sveltekit-superforms/server'
import type { FormErrorMessage } from '$lib/schemas/error'

export async function load({ url, locals: { supabase } }) {
	const code = url.searchParams.get('code')
	if (!code) {
		throw redirect(302, '/auth/password-reset?state=invalid-code')
	}

	const { error } = await supabase.auth.exchangeCodeForSession(code)
	if (error) {
		console.log(error)
		throw redirect(302, '/auth/password-reset?state=invalid-code')
	}

	const form = await superValidate(newPasswordSchema)
	return { form }
}

export const actions = {
	default: async ({ request, url, locals: { supabase } }) => {
		const form = await superValidate<typeof newPasswordSchema, FormErrorMessage>(
			request,
			newPasswordSchema
		)
		if (!form.valid) return fail(400, { form })

		const { error } = await supabase.auth.updateUser({ password: form.data.password })
		if (error) {
			console.log(error)
			return message(form, { type: 'error', text: 'An unknown error occurred' })
		}
		throw redirect(302, '/dashboard/profile')
	}
}
