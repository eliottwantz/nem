import type { SortType } from '$lib/stores/teachersFiltersStore'
import { dbLoadPromise, safeDBCall } from '$lib/utils/error'
import type { Topic } from '@prisma/client'

export async function load({ fetch, locals: { session, user, redirect, db }, url }) {
	if (!session || !user) throw redirect(302, '/signin')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')
	const skip = url.searchParams.get('skip')
	const topic = url.searchParams.get('topic')
	const language = url.searchParams.get('language')
	const ratingMin = url.searchParams.get('ratingMin')
	const topAgent = url.searchParams.get('topAgent')
	const hourRate = url.searchParams.get('priceMax')
	const sortBy: SortType = url.searchParams.get('sortBy')
		? (url.searchParams.get('sortBy') as SortType)
		: 'Popularity'

	const teachers = dbLoadPromise(
		safeDBCall(
			db.teacher.findMany({
				where: {
					topics: topic ? { some: { topic } } : undefined,
					spokenLanguages: language ? { some: { languageId: language } } : undefined,
					rating: ratingMin ? { gte: Number(ratingMin) } : undefined,
					topAgent: topAgent ? Boolean(topAgent) : undefined,
					hourRate: hourRate ? { lte: Number(hourRate) } : undefined
				},
				include: {
					profile: true,
					spokenLanguages: true,
					topics: true
				},
				orderBy: {
					hourRate:
						sortBy === 'PriceHighest'
							? 'desc'
							: sortBy === 'PriceLowest'
							? 'asc'
							: undefined
				},
				skip: skip ? Number(skip) : 0
			})
		),
		[]
	)

	return {
		user,
		teachers,
		total: dbLoadPromise(safeDBCall(db.teacher.count()), 0),
		languages: dbLoadPromise(
			safeDBCall<{ languageId: string }[]>(
				db.$queryRaw`SELECT DISTINCT sl."languageId"
			FROM "_SpokenLanguageToTeacher" tsl
				JOIN "SpokenLanguage" sl ON sl.id = tsl."A"`
			),
			[]
		).then((data) => data.map((l) => l.languageId)),
		topics: dbLoadPromise(
			safeDBCall<Topic[]>(
				db.$queryRaw`SELECT DISTINCT t.topic
				FROM "_TeacherToTopic" tt
				JOIN "Topic" t ON t.topic = tt."B"`
			),
			[]
		).then((data) => data.map((t) => t.topic))
	}
}
