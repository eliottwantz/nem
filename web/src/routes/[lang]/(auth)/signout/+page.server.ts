export const load = async ({ fetch }) => {
	console.log('signout ran')
	const csrfTokenResponse = await fetch(`/auth/csrf`)
	const { csrfToken } = await csrfTokenResponse.json()

	return { csrfToken }
}
