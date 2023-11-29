import type { Message } from '@prisma/client'
import { get, writable } from 'svelte/store'
import { latestWSPayload } from '../ws'
import { page } from '$app/stores'

type ChatState = {
	chatId: number
	messages: Message[]
	unreadMessages: number
	peopleTyping: string[]
	isMore: boolean
}

export const createChatStore = (scrollDownFunc: Function) => {
	console.log('CREATING CHAT STORE')
	const { subscribe, update, set } = writable<ChatState>({
		chatId: 0,
		messages: [],
		peopleTyping: [],
		unreadMessages: 0,
		isMore: true
	})
	const store = {
		subscribe,
		set,
		addNewMessage(message: Message) {
			update((state) => {
				state.messages = [...state.messages, message]
				state.unreadMessages = state.unreadMessages + 1
				return state
			})
			scrollDownFunc()
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
			scrollDownFunc()
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

	latestWSPayload.subscribe((payload) => {
		const user = get(page).data.user
		switch (payload.action) {
			case 'newMessage':
				store.addNewMessage(payload.data)
				break
			case 'addToTyping':
				if (!user) break
				if (payload.data !== user.firstName) store.addTyping(payload.data)
				break
			case 'removeFromTyping':
				if (!user) break
				if (payload.data !== user.firstName) store.removeTyping(payload.data)
				break
		}
	})

	return store
}
