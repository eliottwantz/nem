import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session } }) {
	console.log('profile page.server load')
	if (!session) throw redirect(302, '/login')
	return {
		user: session.user
	}
}
