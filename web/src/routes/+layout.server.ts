export async function load({ locals: { session, user, locale } }) {
	console.log('layout.server.ts ran')
	return {
		session,
		user,
		locale
	}
}
