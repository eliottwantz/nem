import { safeDBCall } from '~/lib/utils/error'

export async function load({ locals: { user, session, redirect, db } }) {
	if (!session || !user) throw redirect(302, '/signin')

	// const res = await Promise.all([
	// 	safeFetch(
	// 		fetchers.messageService(fetch, session).listConversationsOfUser({ userId: user.id })
	// 	)
	// ])
	const res = await safeDBCall(
		db.chat.findMany({
			where: {
				users: {
					some: {
						id: user.id
					}
				}
			},
			include: {
				users: {
					select: {
						id: true,
						profile: true
					}
				},
				messages: {
					select: { createdAt: true },
					orderBy: { createdAt: 'desc' },
					take: 1
				}
			}
		})
	)

	return {
		user,
		chats: res.ok ? res.value : []
	}
}
