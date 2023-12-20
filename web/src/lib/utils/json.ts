import type { ServerMessage } from '$lib/schemas/error'
import { json } from '@sveltejs/kit'

export type AppJsonMessage = typeof appJsonMessage

export const appJsonMessage = (data: ServerMessage, init: ResponseInit | undefined) =>
	json(data, init)
