import { fetchers, safeFetch } from '$lib/api'
import type { Class } from '$lib/api/api.gen'

export async function load({ locals: { session, user, redirect }, fetch }) {
	if (!session || !user) throw redirect(302, '/signin')
	const res = await safeFetch(
		fetchers.teacherService(fetch, session).listClassesOfTeacher({ teacherId: user.id })
	)
	if (!res.ok) {
		console.log(res.error)
		return {
			classes: [] as Class[]
		}
	}
	console.log(res.data.classes)
	return {
		classes: res.data.classes
	}
}
