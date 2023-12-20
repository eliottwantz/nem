import { route } from '$lib/ROUTES'
import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { session, lang }, fetch }) => {
	console.log('login ran')
	if (session) {
		throw redirect(302, route('/', { lang }))
	}

	const csrfTokenResponse = await fetch(`/auth/csrf`)
	const { csrfToken } = await csrfTokenResponse.json()

	return { csrfToken }
}
