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
	topic?: string
	language?: string
	priceMax: number
	ratingMin?: string
	isTopAgent?: boolean
	firstName?: string
	sortBy: string
}
const store = writable<Store>({
	topic: undefined,
	language: undefined,
	priceMax: 45,
	ratingMin: undefined,
	isTopAgent: undefined,
	firstName: undefined,
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
			topic: params.get('topic') ?? undefined,
			language: params.get('language') ?? undefined,
			priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : 45,
			ratingMin: params.get('ratingMin') ?? undefined,
			isTopAgent: params.get('topAgent') ? Boolean(params.get('topAgent')) : undefined,
			firstName: params.get('firstName') ?? undefined,
			sortBy: SortTypeKeyToLabel[sortBy as SortType] ?? SortTypeKeyToLabel.Popularity
		})
	},
	reset: () => {
		store.update((prev) => ({
			...prev,
			priceMax: 45,
			ratingMin: undefined,
			isTopAgent: undefined,
			firstName: undefined,
			sortBy: SortTypeKeyToLabel.Popularity
		}))
	}
}
