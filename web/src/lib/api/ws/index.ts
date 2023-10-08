import { page } from '$app/stores'
import { PUBLIC_ENV, PUBLIC_GO_SERVER_HOST } from '$env/static/public'
import { chatStore } from '$lib/stores/chatStore'
import { userStore } from '$lib/stores/user'
import type { Session } from '@supabase/supabase-js'
import { derived, get, writable } from 'svelte/store'
import type { MessageResponse } from '../api.gen'

type SendPayload = {
	action: 'startTyping' | 'stopTyping' | 'setOnline' | 'setOffline'
	roomId: string
	data: any
}

type ReceivePayload =
	| { action: 'none' }
	| { action: 'newMessage' | 'editMessage' | 'deleteMessage'; data: MessageResponse }
	| { action: 'addToTyping' | 'removeFromTyping'; data: string }
	| { action: 'classEnded' }

const wsPayloadStore = writable<ReceivePayload>({ action: 'none' })
export const latestWSPayload = derived(wsPayloadStore, ($wsPayloadStore) => $wsPayloadStore)

const maxAttempts = 3
class WS {
	#wsEndpoint =
		PUBLIC_ENV === 'DEV'
			? `ws://${PUBLIC_GO_SERVER_HOST}/ws`
			: `wss://${PUBLIC_GO_SERVER_HOST}/ws`
	#attempts = 0
	socket: WebSocket | null = null

	async Connect(): Promise<void> {
		if (this.#attempts > maxAttempts) return
		this.#attempts++
		const websocketUrl = `${this.#wsEndpoint}?jwt=${
			(get(page).data.session as Session).access_token
		}`
		this.socket = new WebSocket(websocketUrl)

		this.socket.addEventListener('open', () => {
			console.log('Opened WS')
		})

		this.socket.addEventListener('close', () => {
			console.log('Closed WS')
			this.socket = null
		})

		this.socket.addEventListener('message', (ev) => {
			const payload: ReceivePayload = JSON.parse(ev.data)
			wsPayloadStore.set(payload)
			const user = get(userStore)
			switch (payload.action) {
				case 'newMessage':
					chatStore.addMessage(payload.data)
					break
				case 'addToTyping':
					if (!user) break
					if (payload.data !== user.firstName) chatStore.addTyping(payload.data)
					break
				case 'removeFromTyping':
					if (!user) break
					if (payload.data !== user.firstName) chatStore.removeTyping(payload.data)
					break
			}
		})

		return new Promise((resolve, reject) => {
			this.socket!.addEventListener('open', () => {
				resolve()
			})
			this.socket!.addEventListener('error', () => {
				reject("Couldn't connect websocket")
			})
			this.socket!.addEventListener('close', () => {
				reject('Websocket already closed')
			})
		})
	}

	send(payload: SendPayload) {
		if (!this.socket) return
		this.socket.send(JSON.stringify(payload))
	}
}

export let ws = new WS()
