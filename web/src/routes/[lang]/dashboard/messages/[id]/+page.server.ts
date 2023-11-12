import { fetchers, safeFetch } from '$lib/api'
import type { User } from '$lib/api/api.gen'

export async function load({ locals: { user, session, redirect }, fetch, params }) {
	if (!session || !user) throw redirect(302, '/signin')

	const streams = await Promise.all([
		safeFetch(
			fetchers
				.messageService(fetch, session)
				.findConversationById({ conversationId: +params.id })
		)
	])

	console.log('is ok?', streams[0].ok)

	if (!streams[0].ok) throw redirect(302, '/dashboard/messages')

	return {
		user,
		conversation: streams[0].data.conversation,
		recipient: streams[0].data.conversation.users.find((u) => u.id !== user.id) as User
	}
}
