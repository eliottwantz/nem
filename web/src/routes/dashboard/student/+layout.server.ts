import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user } }) {
	if (!user) throw redirect(302, '/login')
	if (user.role !== 'student') {
		throw redirect(302, '/')
	}
}
