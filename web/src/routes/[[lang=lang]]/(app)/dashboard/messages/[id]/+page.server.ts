import type { Profile } from '@prisma/client'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'
import { route } from '$lib/ROUTES'

export async function load({ locals: { user, session, db, lang }, params }) {
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

	if (!res.ok) throw redirect(302, route('/dashboard/messages', { lang }))

	return {
		user,
		recipient: res.value.users[0].profile as Profile
	}
}
