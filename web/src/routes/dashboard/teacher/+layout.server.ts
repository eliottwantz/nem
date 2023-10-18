import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user }, url }) {
	if (!user) throw redirect(302, '/login')
	if (user.role !== 'teacher') {
		const redirectUrl = url.pathname.replace('student', 'teacher')
		throw redirect(302, redirectUrl)
	}
}
