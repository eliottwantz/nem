import { page } from '$app/stores'
import { get, writable } from 'svelte/store'

export const SortTypeKeyToLabel = {
	Popularity: 'Popularity'
	// Newest: 'Newest First',
	// Oldest: 'Oldest First',
	// BestRating: 'Best Rating',
	// NumberOfRatings: 'Number of Ratings',
	// ClassesTaught: 'Classes Taught',
	// PriceLowest: 'Price: Lowest',
	// PriceHighest: 'Price: Highest'
} as const
export const SortLabelToTypeKey = Object.fromEntries(
	Object.entries(SortTypeKeyToLabel).map(([key, value]) => [value, key]) as [string, SortType][]
)
export type SortType = keyof typeof SortTypeKeyToLabel

type Store = {
	topic: string
	language: string
	priceMax: number
	ratingMin: string
	isTopAgent: boolean
	sortBy: string
}
const store = writable<Store>({
	topic: '',
	language: '',
	priceMax: 1000,
	ratingMin: '0',
	isTopAgent: false,
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
			topic: params.get('topic') ?? '',
			language: params.get('language') ?? '',
			priceMax: Number(params.get('priceMax') ?? 1000),
			ratingMin: params.get('ratingMin') ?? '0',
			isTopAgent: Boolean(params.get('topAgent') === 'true'),
			sortBy: SortTypeKeyToLabel[sortBy as SortType] ?? SortTypeKeyToLabel.Popularity
		})
	}
}
