import { page } from '$app/stores'
import { PUBLIC_ENV, PUBLIC_GO_SERVER_HOST } from '$env/static/public'
import type { Message } from '@prisma/client'
import { derived, get, writable } from 'svelte/store'

type SendPayload =
	| {
			action: 'startTyping' | 'stopTyping' | 'setOnline' | 'setOffline'
			chatId: string
			data: string
	  }
	| { action: 'sendMessage' | 'editMessage'; chatId: string; data: Message }
	| { action: 'usersJoinRoom'; chatId: string; data: string[] }

type ReceivePayload =
	| { action: 'none' }
	| { action: 'newMessage' | 'editMessage' | 'deleteMessage'; data: Message }
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
		const websocketUrl = `${this.#wsEndpoint}?uID=${get(page).data.user?.id}`
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
