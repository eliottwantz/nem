import type { APIErrorJson } from '$lib/api'
import type { Message } from '@prisma/client'
import { json } from '@sveltejs/kit'
import { safeDBCall } from '$lib/utils/error'

export type SendMessageRequest = {
	text: string
}

export async function POST({ locals: { session, user, db }, request, params }) {
	if (!session || !user)
		return json({ message: 'Unauthorized' } satisfies APIErrorJson, { status: 401 })
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
		return json({ message: 'Internal Server Error' } satisfies APIErrorJson, { status: 500 })
	}
	return json(res.value satisfies Message)
}
