import { fail, redirect } from '@sveltejs/kit'

export async function load({ url }) {
	const state = url.searchParams.get('state')
	if (state === 'invalid-code') {
		return {
			invalidCode: true
		}
	}
	return {
		invalidCode: false
	}
}

export const actions = {
	default: async ({ locals: { supabase }, cookies, url }) => {
		const email = cookies.get('email')
		if (!email) {
			throw redirect(302, '/login')
		}

		const { error } = await supabase.auth.resend({
			email,
			type: 'signup',
			options: {
				emailRedirectTo: `${url.origin}/register/verify-email/callback`
			}
		})
		if (error) {
			return {
				message: 'Could not send confirmation email. Try again later.',
				success: false
			}
		}

		const expired = url.searchParams.get('code') !== null
		let message = 'Please check your email for a confirmation link to log into the website.'
		if (expired) {
			message =
				'Link expired. We sent you a new one. Please check your email for a confirmation link to log into the website.'
		}
		return {
			message,
			success: true
		}
	}
}
