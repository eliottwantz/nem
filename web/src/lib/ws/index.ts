import { page } from '$app/stores'
import { PUBLIC_ENV, PUBLIC_GO_SERVER_HOST } from '$env/static/public'
import type { Message } from '@prisma/client'
import { derived, get, writable } from 'svelte/store'

type SendPayload =
	| {
			action: 'startTyping' | 'stopTyping' | 'setOnline' | 'setOffline'
			roomId: string
			data: string
	  }
	| { action: 'sendMessage' | 'editMessage'; roomId: string; data: Message }
	| { action: 'joinRoom'; roomId: string }

type ReceivePayload =
	| { action: 'none' }
	| { action: 'newMessage' | 'editMessage' | 'deleteMessage'; data: Message }
	| { action: 'addToTyping' | 'removeFromTyping'; data: string }
	| { action: 'classEnded' }

const wsPayloadStore = writable<ReceivePayload>({ action: 'none' })
export const latestWSPayload = derived(wsPayloadStore, ($wsPayloadStore) => $wsPayloadStore)

class WS {
	#wsEndpoint =
		PUBLIC_ENV === 'DEV'
			? `ws://${PUBLIC_GO_SERVER_HOST}/ws`
			: `wss://${PUBLIC_GO_SERVER_HOST}/ws`
	socket: WebSocket | null = null
	connected = false

	async Connect() {
		const websocketUrl = `${this.#wsEndpoint}?uID=${get(page).data.user?.id}`
		this.socket = new WebSocket(websocketUrl)

		this.socket.addEventListener('open', () => {
			this.connected = true
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
	}

	send(payload: SendPayload) {
		if (!this.socket) return
		this.socket.send(JSON.stringify(payload))
	}
}

export let ws = new WS()
