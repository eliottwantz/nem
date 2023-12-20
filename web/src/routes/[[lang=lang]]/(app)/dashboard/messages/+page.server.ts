import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { user, session, db, lang } }) {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))

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
