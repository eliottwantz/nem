import { route } from '$lib/ROUTES'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user, lang }, url }) {
	if (!user) throw redirect(302, route('/signin', { lang }))
	if (user.role !== 'teacher') {
		const redirectUrl = url.pathname.replace('teacher', 'student')
		throw redirect(302, redirectUrl)
	}
}
