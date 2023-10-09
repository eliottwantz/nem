import { createStudentSchema } from '$lib/schemas/profile'
import { redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user } }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, '/')
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	const form = await superValidate(createStudentSchema)
	form.data.role = 'student'
	return { form }
}
