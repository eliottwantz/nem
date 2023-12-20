import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export const ssr = false

export async function load({ locals: { session, user, db, lang }, params }) {
	console.log('In class load')
	if (!session || !user) throw redirect(302, route('/', { lang }))

	let disconnectUrl = ''
	switch (user.role) {
		case 'student':
			disconnectUrl = '/dashboard/student/classes'
			break
		case 'teacher':
			disconnectUrl = '/dashboard/teacher/classes'
			break
		default:
			disconnectUrl = '/'
			break
	}

	const res = await safeDBCall(
		db.class.findUnique({
			where: { id: params.id },
			include: {
				teacher: { select: { id: true } }
			}
		})
	)
	if (!res.ok) {
		throw redirect(302, disconnectUrl)
	}
	return {
		user,
		class: res.value,
		disconnectUrl
	}
}
