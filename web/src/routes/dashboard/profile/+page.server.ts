import { redirect, type Actions } from '@sveltejs/kit'

export async function load({ locals: { user } }) {
	console.log('profile page.server load')
	if (!user) throw redirect(302, '/login')
	return {
		user
	}
}
