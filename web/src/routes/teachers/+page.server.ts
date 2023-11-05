import { fetchers, safeFetch } from '$lib/api'
import type { ListTeacher } from '$lib/api/api.gen'
import { redirect } from '@sveltejs/kit'

export async function load({ fetch, locals: { session, user }, url }) {
	if (!session || !user) throw redirect(302, '/login')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')
	const cursor = Number(url.searchParams.get('cursor'))
	const topic = url.searchParams.get('topic') ?? ''
	const language = url.searchParams.get('language') ?? ''
	const ratingMin = Number(url.searchParams.get('ratingMin'))
	const topAgent = Boolean(url.searchParams.get('topAgent') === 'true')
	const priceMax = Number(url.searchParams.get('priceMax') || 1000)

	return {
		user,
		teachers: new Promise<ListTeacher[]>((resolve) => {
			safeFetch(
				fetchers.userService(fetch, session).listTeachers({
					filters: {
						cursor,
						language,
						priceMax,
						ratingMin,
						topAgent,
						topic
					}
				})
			).then((res) => {
				if (res.ok) resolve(res.data.teachers)
				else resolve([])
			})
		}),
		total: new Promise<number>((resolve) => {
			safeFetch(fetchers.userService(fetch, session).teachersCount()).then((res) => {
				if (res.ok) resolve(res.data.count)
				else resolve(0)
			})
		}),
		languages: new Promise<string[]>((resolve) => {
			safeFetch(fetchers.userService(fetch, session).listLanguagesTaught()).then((res) => {
				if (res.ok) resolve(res.data.languages)
				else resolve([])
			})
		}),
		topics: new Promise<string[]>((resolve) => {
			safeFetch(fetchers.userService(fetch, session).listTopicsTaught()).then((res) => {
				if (res.ok) resolve(res.data.topics.map((t) => t.topic))
				else resolve([])
			})
		})
	}
}
