import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { session, user } }) => {
	if (!session) throw redirect(302, '/')
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}
}