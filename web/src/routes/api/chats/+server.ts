import type { APIErrorJson } from '$lib/api'
import { json } from '@sveltejs/kit'

export type CreateChatRequest = {
	withUserIds: string[]
}
export type CreateChatResponse = {
	id: string
}

export async function POST({ locals: { session, user, db }, request }) {
	if (!session || !user)
		return json({ message: 'Unauthorized!!!' } satisfies APIErrorJson, { status: 401 })
	const req = (await request.json()) as CreateChatRequest
	// Create a new conversation
	const res = await db.$transaction(async (tx) => {
		const convo = await tx.chat.create({
			data: {
				users: {
					connect: req.withUserIds.concat(user.id).map((id) => ({ id }))
				}
			}
		})
		return convo.id
	})
	if (!res) {
		return json({ message: 'Internal Server Error' } satisfies APIErrorJson, { status: 500 })
	}
	return json({ id: res })
}
