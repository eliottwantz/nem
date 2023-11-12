import { fetchers, safeFetch } from '$lib/api'

export async function load({ locals: { user, session, redirect }, fetch }) {
	if (!session || !user) throw redirect(302, '/signin')

	const streams = await Promise.all([
		safeFetch(
			fetchers.messageService(fetch, session).listConversationsOfUser({ userId: user.id })
		)
	])

	return {
		user,
		conversations: streams[0].ok ? streams[0].data.conversations : []
	}
}
