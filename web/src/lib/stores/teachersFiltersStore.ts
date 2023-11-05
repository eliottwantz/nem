import { page } from '$app/stores'
import { get, writable } from 'svelte/store'

type Store = {
	topic: string
	language: string
	priceMax: number
	ratingMin: string
	isTopAgent: boolean
}
const store = writable<Store>({
	topic: '',
	language: '',
	priceMax: 1000,
	ratingMin: '0',
	isTopAgent: false
})
export const teachersFiltersStore = {
	subscribe: store.subscribe,
	set: store.set,
	update: store.update,

	fromURL: () => {
		const params = new URLSearchParams(get(page).url.search)
		store.set({
			topic: params.get('topic') ?? '',
			language: params.get('language') ?? '',
			priceMax: Number(params.get('priceMax') ?? 1000),
			ratingMin: params.get('ratingMin') ?? '0',
			isTopAgent: Boolean(params.get('topAgent') === 'true')
		})
	}
}
