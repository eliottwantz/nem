import type { APIErrorJson } from '$lib/api'
import { safeDBCall } from '$lib/utils/error'
import type { Message } from '@prisma/client'
import { json } from '@sveltejs/kit'

export type MessagesResponse = {
	messages: Message[]
	isMore: boolean
}

export async function GET({ locals: { session, user, db }, params, url }) {
	if (!session || !user)
		return json({ message: 'Unauthorized' } satisfies APIErrorJson, { status: 401 })
	const cursor = url.searchParams.get('cursor')
	const res = await safeDBCall(
		db.message.findMany({
			where: {
				chatId: params.id
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
		return json({ message: 'Internal Server Error' } satisfies APIErrorJson, { status: 500 })
	}
	return json({ messages: res.value, isMore: res.value.length === 20 } satisfies MessagesResponse)
}
