import { route } from '$lib/ROUTES'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, user, lang } }) {
	console.log('profile page.server load')
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	return {
		user
	}
}
