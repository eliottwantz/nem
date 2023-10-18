import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user }, url }) {
	if (!user) throw redirect(302, '/login')
	if (user.role !== 'student') {
		const redirectUrl = url.pathname.replace('teacher', 'student')
		throw redirect(302, redirectUrl)
	}
}
