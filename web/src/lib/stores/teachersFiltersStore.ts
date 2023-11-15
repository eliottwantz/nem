import { page } from '$app/stores'
import { get, writable } from 'svelte/store'

export const SortTypeKeyToLabel = {
	Popularity: 'Popularity',
	Newest: 'Newest First',
	Oldest: 'Oldest First',
	BestRating: 'Best Rating',
	NumberOfReviews: 'Number of Reviews',
	ClassesTaught: 'Classes Taught',
	PriceLowest: 'Price: Lowest',
	PriceHighest: 'Price: Highest'
} as const
export const SortLabelToTypeKey = Object.fromEntries(
	Object.entries(SortTypeKeyToLabel).map(([key, value]) => [value, key]) as [string, SortType][]
)
export type SortType = keyof typeof SortTypeKeyToLabel

type Store = {
	page: number
	topic?: string
	language?: string
	priceMax: number
	ratingMin?: string
	isTopAgent?: boolean
	sortBy: string
}
const store = writable<Store>({
	page: 0,
	topic: undefined,
	language: undefined,
	priceMax: 45,
	ratingMin: undefined,
	isTopAgent: undefined,
	sortBy: SortTypeKeyToLabel.Popularity
})
export const teachersFiltersStore = {
	subscribe: store.subscribe,
	set: store.set,
	update: store.update,

	fromURL: () => {
		const params = new URLSearchParams(get(page).url.search)
		let sortBy = params.get('sortBy') ?? SortTypeKeyToLabel.Popularity
		store.set({
			page: Number(params.get('page')) ?? 0,
			topic: params.get('topic') ?? undefined,
			language: params.get('language') ?? undefined,
			priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : 45,
			ratingMin: params.get('ratingMin') ?? undefined,
			isTopAgent: params.get('topAgent') ? Boolean(params.get('topAgent')) : undefined,
			sortBy: SortTypeKeyToLabel[sortBy as SortType] ?? SortTypeKeyToLabel.Popularity
		})
	}
}
