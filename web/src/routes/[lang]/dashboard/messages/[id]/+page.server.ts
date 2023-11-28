import type { Profile } from '@prisma/client'
import { safeDBCall } from '~/lib/utils/error'

export async function load({ locals: { user, session, redirect, db }, params }) {
	if (!session || !user) throw redirect(302, '/signin')

	const res = await safeDBCall(
		db.chat.findUnique({
			where: { id: params.id },
			select: {
				users: {
					where: {
						id: {
							not: user.id
						}
					},
					select: {
						profile: true
					}
				}
			}
		})
	)

	if (!res.ok) throw redirect(302, '/dashboard/messages')

	return {
		user,
		recipient: res.value.users[0].profile as Profile
	}
}
