import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user, session }, fetch, params }) {
	if (!session || !user) throw redirect(302, '/login')

	const streams = await Promise.all([
		safeFetch(
			fetchers
				.messageService(fetch, session)
				.findConversationById({ conversationId: +params.id })
		)
	])

	if (!streams[0].ok) throw redirect(302, '/dashboard/messages')

	return {
		user,
		conversation: streams[0].data.conversation
	}
}
