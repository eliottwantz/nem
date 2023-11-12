import { safeDBCall } from '$lib/utils/error'
import { error, redirect } from '@sveltejs/kit'

export async function load({ params, locals: { db, session, user } }) {
	if (!session || !user) throw redirect(302, '/signin')
	const res = await safeDBCall(db.profile.findUnique({ where: { id: params.id } }))

	if (!res.ok) {
		console.log(res.error)
		throw error(404, 'User not found')
	}

	return {
		userToShow: res.value,
		user
	}
}
