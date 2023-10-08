import { fetchers, safeFetch } from '$lib/api'
import type { User } from '$lib/api/api.gen'
import { redirect } from '@sveltejs/kit'

export async function load({ fetch, locals: { session } }) {
	if (!session) throw redirect(302, '/login')
	const res = await safeFetch(fetchers.adminService(fetch, session).adminListUsers())
	if (!res.ok) {
		console.log(res.error)
		return {
			users: [] as User[]
		}
	}

	return {
		users: res.data.users
	}
}
