import { safeDBCall } from '$lib/utils/error'
import type { Message } from '@prisma/client'
import { json } from '@sveltejs/kit'

export type MessagesResponse = {
	messages: Message[]
	isMore: boolean
}

export const GET = async ({ locals: { session, user, db, message }, params, url }) => {
	if (!session || !user) return message({ type: 'error', text: 'Unauthorized' }, { status: 401 })
	const cursor = url.searchParams.get('cursor')
	const res = await safeDBCall(
		db.message.findMany({
			where: {
				chatId: params.chatId
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: 20,
			skip: cursor ? 1 : undefined,
			cursor: cursor
				? {
						id: +cursor
				  }
				: undefined
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return message({ type: 'error', text: 'Could not load messages' }, { status: 500 })
	}
	return json({ messages: res.value, isMore: res.value.length === 20 } satisfies MessagesResponse)
}
