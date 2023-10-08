import type { FormErrorMessage } from '$lib/schemas/error'
import { loginSchema } from '$lib/schemas/login'
import { AuthApiError, type Provider } from '@supabase/supabase-js'
import { fail, redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session } }) => {
	if (session) {
		throw redirect(302, '/')
	}

	const form = await superValidate(loginSchema)
	return { form }
}

export const actions = {
	login: async ({ request, locals: { supabase } }) => {
		const form = await superValidate<typeof loginSchema, FormErrorMessage>(request, loginSchema)
		console.log('POST login', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		const { error } = await supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		})
		if (error) {
			console.log(error)
			if (error instanceof AuthApiError) {
				if (error.message === 'Email not confirmed') {
					throw redirect(302, '/register/verify-email')
				}
				return message(form, { type: 'error', text: 'Invalid email or password' })
			} else {
				return message(form, { type: 'error', text: 'An unknown error occurred' })
			}
		}

		throw redirect(302, '/dashboard/profile')
	},
	oauth: async ({ url, locals: { supabase } }) => {
		const providerStr = url.searchParams.get('provider')
		console.log('oauth:', url.pathname, ',provider =', providerStr)
		if (!providerStr) {
			throw redirect(302, '/')
		}
		const provider: Provider = providerStr as Provider
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/auth/callback?provider=${providerStr}`
			}
		})
		if (error) {
			console.log(error)
			return fail(500, {
				message: error.message,
				success: false
			})
		}
		console.log('Signing in with', provider, 'at', data.url)
		throw redirect(302, data.url)
	}
}
