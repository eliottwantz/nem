import { fetchers, safeFetch } from '$lib/api'
import type { Class } from '$lib/api/api.gen'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session }, fetch }) {
	if (!session) throw redirect(302, '/login')
	const res = await safeFetch(fetchers.adminService(fetch, session).adminListClasses())
	if (!res.ok) {
		console.log(res.error)
		return {
			classes: [] as Class[]
		}
	}

	return {
		classes: res.data.classes
	}
}
