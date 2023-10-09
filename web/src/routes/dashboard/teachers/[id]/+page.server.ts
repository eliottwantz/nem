import { fetchers, safeFetch } from '$lib/api'
import { error, redirect } from '@sveltejs/kit'

export async function load({ params, fetch, locals: { session, user } }) {
	if (!session || !user) throw redirect(302, '/login')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')
	const res = await safeFetch(
		fetchers.userService(fetch, session).findTeacherByID({ id: params.id })
	)

	if (!res.ok) {
		console.log(res.error)
		throw error(res.error.status, 'User not found')
	}

	return {
		teacher: res.data.teacher,
		user
	}
}
