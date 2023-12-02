import { safeDBCall } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export type SendMessageRequest = {
	text: string
}

export const POST = async ({ locals: { session, user, db, message }, request, params }) => {
	if (!session || !user) return message({ type: 'error', text: 'Unauthorized' }, { status: 401 })
	const req = (await request.json()) as SendMessageRequest

	const res = await safeDBCall(
		db.message.create({
			data: {
				text: req.text,
				sender: { connect: { id: user.id } },
				chat: { connect: { id: params.chatId } }
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return message({ type: 'error', text: 'Could not send message' }, { status: 500 })
	}
	return json(res.value)
}
