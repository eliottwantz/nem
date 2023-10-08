import type { MessageResponse } from '$lib/api/api.gen'
import { writable } from 'svelte/store'

type ChatState = {
	messages: MessageResponse[]
	unreadMessages: number
	peopleTyping: string[]
}

const { subscribe, update } = writable<ChatState>({
	messages: [],
	peopleTyping: [],
	unreadMessages: 0
})
export const chatStore = {
	subscribe,
	addMessage: (message: MessageResponse) => {
		update((state) => {
			state.messages = [...state.messages, message]
			state.unreadMessages = state.unreadMessages + 1
			return state
		})
	},
	removeMessage: (message: MessageResponse) => {
		update((state) => {
			state.messages = [...state.messages.filter((m) => m.id !== message.id)]
			return state
		})
	},
	resetMessages: () => {
		update((state) => {
			state.messages = []
			return state
		})
	},
	addTyping: (firstName: string) => {
		update((state) => {
			state.peopleTyping = [firstName, ...state.peopleTyping]
			return state
		})
	},
	removeTyping: (firstName: string) => {
		update((state) => {
			state.peopleTyping = [
				...state.peopleTyping.filter((username) => username !== firstName)
			]
			return state
		})
	},
	resetTyping: () => {
		update((state) => {
			state.peopleTyping = []
			return state
		})
	},
	get unreadMessages() {
		let value = 0
		subscribe((state) => (value = state.unreadMessages))()
		return value
	},
	resetUnreadMessages: () => {
		update((state) => {
			state.unreadMessages = 0
			return state
		})
	}
}
