import { route } from '$lib/ROUTES'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user, lang }, url }) {
	if (!user) throw redirect(302, route('/signin', { lang }))
	console.log('student layout.server.ts')
	if (user.role !== 'student') {
		const redirectUrl = url.pathname.replace('student', 'teacher')
		throw redirect(302, redirectUrl)
	}
}
