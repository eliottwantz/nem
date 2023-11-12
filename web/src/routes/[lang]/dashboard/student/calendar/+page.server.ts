import { fetchers, safeFetch } from '$lib/api'

export async function load({ locals: { session, redirect }, fetch }) {
	if (!session) throw redirect(302, '/signin')

	const res = await safeFetch(fetchers.studentService(fetch, session).listClasses())

	return {
		success: res.ok,
		message: !res.ok ? res.cause : '',
		classes: res.ok ? res.data.classes : []
	}
}
