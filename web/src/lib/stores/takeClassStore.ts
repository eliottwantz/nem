import type { CalendarInteractEvent } from '$lib/components/Calendar'
import { get, writable } from 'svelte/store'

type Store = {
	selectedLanguage: string | undefined
	selectedTopic: string | undefined
	selectedIsPrivate: boolean
	selectedEvent: CalendarInteractEvent | undefined
}
const store = writable<Store>({
	selectedLanguage: undefined,
	selectedTopic: undefined,
	selectedIsPrivate: false,
	selectedEvent: undefined
})
export const takeClassStore = {
	subscribe: store.subscribe,
	set: store.set,
	isInValid() {
		if (
			!get(store).selectedLanguage ||
			!get(store).selectedTopic ||
			!get(store).selectedEvent
		) {
			return true
		}
		return false
	}
}
