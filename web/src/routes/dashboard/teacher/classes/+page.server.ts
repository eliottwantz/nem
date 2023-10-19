import { fetchers, safeFetch } from '$lib/api'
import type { Class } from '$lib/api/api.gen'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session, user }, fetch }) {
	if (!session || !user) throw redirect(302, '/login')
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
		classes: res.data.classes.map((c) => ({
			...c,
			startAt: new Date(c.startAt).toLocaleString(user.preferedLanguage),
			endAt: new Date(c.endAt).toLocaleString(user.preferedLanguage)
		}))
	}
}
