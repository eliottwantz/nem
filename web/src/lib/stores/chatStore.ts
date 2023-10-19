import type { Message } from '$lib/api/api.gen'
import { writable } from 'svelte/store'

type ChatState = {
	conversationId: number
	messages: Message[]
	unreadMessages: number
	peopleTyping: string[]
	isMore: boolean
}

const { subscribe, update, set } = writable<ChatState>({
	conversationId: 0,
	messages: [],
	peopleTyping: [],
	unreadMessages: 0,
	isMore: true
})
export const chatStore = {
	subscribe,
	set,
	addNewMessage(message: Message) {
		update((state) => {
			state.messages = [...state.messages, message]
			state.unreadMessages = state.unreadMessages + 1
			return state
		})
	},
	addOldMessages(messages: Message[]) {
		update((state) => {
			state.messages = [...messages.reverse(), ...state.messages]
			return state
		})
	},
	removeMessage: (message: Message) => {
		update((state) => {
			state.messages = [...state.messages.filter((m) => m.id !== message.id)]
			return state
		})
	},
	reset: () => {
		set({
			conversationId: 0,
			messages: [],
			peopleTyping: [],
			unreadMessages: 0,
			isMore: true
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
	},
	get oldestMessage() {
		let value: Message | undefined
		subscribe((state) => (value = state.messages[0]))()
		return value
	},
	get latestMessage() {
		let value: Message | undefined
		subscribe((state) => (value = state.messages[state.messages.length - 1]))()
		return value
	}
}
