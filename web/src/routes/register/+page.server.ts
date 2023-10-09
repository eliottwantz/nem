import { fetchers, safeFetch } from '$lib/api'
import type { ServerMessage } from '$lib/schemas/error'
import { registerSchema } from '$lib/schemas/register'
import { AuthApiError, type Provider } from '@supabase/supabase-js'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export async function load({ locals: { session } }) {
	console.log('register ran')
	if (session) {
		throw redirect(302, '/dashboard/profile')
	}
	const form = await superValidate(registerSchema)

	return { form }
}

export const actions = {
	email: async ({ request, locals: { supabase }, cookies, url }) => {
		const form = await superValidate<typeof registerSchema, ServerMessage>(
			request,
			registerSchema
		)
		console.log('POST register', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		const { data, error } = await supabase.auth.signUp({
			email: form.data.email.toLowerCase(),
			password: form.data.password.trim(),
			options: {
				emailRedirectTo: `${url.origin}/register/verify-email/callback`
			}
		})

		if (error) {
			console.log(error)
			if (error instanceof AuthApiError) {
				if (error.message === 'User already registered') {
					throw redirect(302, '/login')
				}
				return message(form, { type: 'error', text: 'Invalid email or password' })
			}
			return message(form, { type: 'error', text: 'An unknown error occurred' })
		}

		cookies.set('email', form.data.email)

		throw redirect(302, '/register/verify-email')
	},
	oauth: async ({ request, locals: { supabase }, url }) => {
		const provider = url.searchParams.get('provider') as Provider
		if (!provider) {
			return {
				text: 'No provider provided',
				type: 'error'
			} satisfies ServerMessage
		}
		if (!['google'].includes(provider)) {
			return {
				text: 'Invalid provider',
				type: 'error'
			} satisfies ServerMessage
		}

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/register/setup-profile`
			}
		})
		if (error) {
			console.log(error)
			return fail(500, {
				message: error.message,
				success: false
			})
		}
		throw redirect(307, `${url.origin}/register/setup-profile`)
	}
}
