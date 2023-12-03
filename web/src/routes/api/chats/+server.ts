import { safeDBCall } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export type CreateChatRequest = {
	withUserIds: string[]
}
export type CreateChatResponse = {
	id: string
}

export const POST = async ({ locals: { session, user, db, message }, request }) => {
	if (!session || !user) return message({ type: 'error', text: 'Unauthorized' }, { status: 401 })
	const req = (await request.json()) as CreateChatRequest
	// Create a new chat
	const res = await safeDBCall(
		db.chat.create({
			data: {
				users: {
					connect: req.withUserIds.concat(user.id).map((id) => ({ id }))
				}
			}
		})
	)
	if (!res.ok) {
		return message({ type: 'error', text: 'Could not create chat' }, { status: 500 })
	}
	return json({ id: res.value.id } satisfies CreateChatResponse)
}
