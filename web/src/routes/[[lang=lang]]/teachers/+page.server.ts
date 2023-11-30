import type { SortType } from '$lib/stores/teachersFiltersStore'
import { dbLoadPromise, safeDBCall } from '$lib/utils/error'
import type { Topic } from '@prisma/client'

export async function load({ locals: { session, user, redirect, db }, url }) {
	if (!session || !user) throw redirect(302, '/signin')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')
	if (!url.searchParams.get('language') || !url.searchParams.get('topic')) {
		throw redirect(302, '/teachers?topic=English&language=French')
	}
	const language = url.searchParams.get('language') ?? 'French'
	const topic = url.searchParams.get('topic') ?? 'English'
	const page = url.searchParams.get('page')
	const ratingMin = url.searchParams.get('ratingMin')
	const topAgent = url.searchParams.get('topAgent')
	const hourRate = url.searchParams.get('priceMax')
	let firstName = url.searchParams.get('firstName')
	if (firstName) {
		firstName = firstName.trim()
		// firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
	}
	const sortBy: SortType = url.searchParams.get('sortBy')
		? (url.searchParams.get('sortBy') as SortType)
		: 'Popularity'

	const take = 7

	const teachers = dbLoadPromise(
		safeDBCall(
			db.$transaction(async (tx) => {
				const ids = await tx.teacher.findMany({
					select: { id: true },
					where: {
						topics: { some: { topic } },
						spokenLanguages: { some: { languageId: language } },
						rating: ratingMin ? { gte: Number(ratingMin) } : undefined,
						topAgent: topAgent ? Boolean(topAgent) : undefined,
						hourRate: hourRate ? { lte: Number(hourRate) } : undefined,
						profile: firstName
							? { firstName: { contains: firstName, mode: 'insensitive' } }
							: undefined
					},
					orderBy: {
						hourRate:
							sortBy === 'PriceHighest'
								? 'desc'
								: sortBy === 'PriceLowest'
								? 'asc'
								: undefined,
						profile:
							sortBy === 'Newest'
								? {
										createdAt: 'desc'
								  }
								: sortBy === 'Oldest'
								? {
										createdAt: 'asc'
								  }
								: undefined,
						rating: sortBy === 'BestRating' ? 'desc' : undefined,
						reviews: sortBy === 'NumberOfReviews' ? { _count: 'desc' } : undefined,
						studentSubscriptions:
							sortBy === 'Popularity' ? { _count: 'desc' } : undefined,
						classesTaught: sortBy === 'ClassesTaught' ? 'desc' : undefined
					}
				})
				// Check if skip is out of bounds
				let skip = Number(page) * take
				if (skip >= ids.length) {
					skip = 0
				}
				const teachers = await tx.teacher.findMany({
					where: {
						topics: { some: { topic } },
						spokenLanguages: { some: { languageId: language } },
						rating: ratingMin ? { gte: Number(ratingMin) } : undefined,
						topAgent: topAgent ? Boolean(topAgent) : undefined,
						hourRate: hourRate ? { lte: Number(hourRate) } : undefined,
						profile: firstName
							? { firstName: { contains: firstName, mode: 'insensitive' } }
							: undefined
					},
					include: {
						studentSubscriptions: { select: { studentId: true } },
						profile: true,
						spokenLanguages: true,
						topics: true,
						reviews: true,
						classes: { select: { _count: true } }
					},
					take,
					skip,
					orderBy: {
						hourRate:
							sortBy === 'PriceHighest'
								? 'desc'
								: sortBy === 'PriceLowest'
								? 'asc'
								: undefined,
						profile:
							sortBy === 'Newest'
								? {
										createdAt: 'desc'
								  }
								: sortBy === 'Oldest'
								? {
										createdAt: 'asc'
								  }
								: undefined,
						rating: sortBy === 'BestRating' ? 'desc' : undefined,
						reviews: sortBy === 'NumberOfReviews' ? { _count: 'desc' } : undefined,
						studentSubscriptions:
							sortBy === 'Popularity' ? { _count: 'desc' } : undefined,
						classesTaught: sortBy === 'ClassesTaught' ? 'desc' : undefined
					}
				})
				return {
					teachers,
					count: ids.length,
					page: skip === 0 ? 0 : skip / take
				}
			})
		),
		{ count: 0, teachers: [], page: 0 }
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
		).then((data) => data.map((t) => t.topic)),
		take
	}
}
