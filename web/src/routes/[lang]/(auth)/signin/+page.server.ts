import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { session }, fetch }) => {
	console.log('login ran')
	if (session) {
		throw redirect(302, '/')
	}

	const csrfTokenResponse = await fetch(`/auth/csrf`)
	const { csrfToken } = await csrfTokenResponse.json()

	return { csrfToken }
}
