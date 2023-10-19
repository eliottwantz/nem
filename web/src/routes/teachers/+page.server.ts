import { fetchers, safeFetch } from '$lib/api'
import { error, redirect } from '@sveltejs/kit'

export async function load({ params, fetch, locals: { session, user }, url }) {
	if (!session || !user) throw redirect(302, '/login')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')
	const cursor = url.searchParams.get('cursor') ?? ''
	const language = url.searchParams.get('language') ?? ''
	const priceMax = Number(url.searchParams.get('priceMax')) ?? 1000
	const ratingMax = Number(url.searchParams.get('ratingMax')) ?? 5
	const ratingMin = Number(url.searchParams.get('ratingMin')) ?? 0
	const topAgent = Boolean(url.searchParams.get('topAgent')) ?? false
	const topic = url.searchParams.get('topic') ?? ''
	const res = await safeFetch(
		fetchers.userService(fetch, session).listTeachers({
			filters: {
				cursor,
				language,
				priceMax,
				ratingMax,
				ratingMin,
				topAgent,
				topic
			}
		})
	)

	if (!res.ok) {
		console.log(res.error)
		throw error(res.error.status, 'Could not fetch teachers')
	}

	return {
		teachers: res.data.teachers,
		user
	}
}
