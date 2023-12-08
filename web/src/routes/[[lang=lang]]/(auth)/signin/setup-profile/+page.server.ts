import { route } from '$lib/ROUTES'
import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { session, user, lang } }) => {
	if (!session) throw redirect(302, route('/', { lang }))
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, route('/dashboard/profile', { lang }))
	}
}
