import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, user } }) {
	console.log('profile page.server load')
	if (!session || !user) throw redirect(302, '/signin')
	return {
		user
	}
}
