import { fetchers, safeFetch } from '$lib/api'
import type { Class, ListClass } from '$lib/api/api.gen'
import { redirect } from '@sveltejs/kit'

export async function load({ fetch, locals: { session, user } }) {
	if (!session || !user) throw redirect(302, '/signin')
	const res = await safeFetch(fetchers.studentService(fetch, session).listClasses())
	if (!res.ok) {
		console.log(res.error)
		return {
			classes: [] as ListClass[]
		}
	}

	return {
		classes: res.data.classes
	}
}
