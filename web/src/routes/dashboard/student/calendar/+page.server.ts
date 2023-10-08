import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session }, fetch }) {
	if (!session) throw redirect(302, '/login')

	const res = await safeFetch(fetchers.studentService(fetch, session).listClasses())

	return {
		success: res.ok,
		message: !res.ok ? res.cause : '',
		classes: res.ok ? res.data.classes : []
	}
}
