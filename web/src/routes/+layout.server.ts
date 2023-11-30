export async function load({ locals: { session, user } }) {
	console.log('layout.server.ts ran')
	return {
		session,
		user
	}
}
