import { fetchers, safeFetch } from '$lib/api'
import { error, redirect } from '@sveltejs/kit'

export async function load({ params, fetch, locals: { session, user } }) {
	if (!session || !user) throw redirect(302, '/login')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')
	const res = await Promise.all([
		safeFetch(fetchers.userService(fetch, session).findTeacherByID({ id: params.id })),
		safeFetch(fetchers.teacherService(fetch, session).listAvailabilities()),
		safeFetch(fetchers.teacherService(fetch, session).listClasses())
	])

	if (!res[0].ok) {
		console.log(res[0].error)
		throw error(res[0].error.status, 'User not found')
	}

	return {
		teacher: res[0].data.teacher,
		availabilities: res[1].ok ? res[1].data.timeSlots : [],
		classes: res[2].ok ? res[2].data.classes : [],
		user
	}
}
