import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export const ssr = false

export async function load({ locals: { session }, url, fetch }) {
	console.log('In class load')
	if (!session) throw redirect(302, '/')

	const classId = url.pathname.split('/')[2]

	const res = await safeFetch(fetchers.classService(fetch, session).showClassDetails({ classId }))
	if (!res.ok) {
		switch (session.user.role) {
			case 'student':
				throw redirect(302, '/dashboard/student/classes')
			case 'teacher':
				throw redirect(302, '/dashboard/teacher/classes')
			default:
				throw redirect(302, '/')
		}
	}
	const tokenRes = await safeFetch(
		fetchers.classService(fetch, session).getJoinToken({ roomId: classId })
	)
	let disconnectUrl = ''
	switch (session.user.role) {
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
	return {
		user: session.user,
		classDetails: res.data.classDetails,
		token: tokenRes.ok ? tokenRes.data.token : undefined,
		disconnectUrl
	}
}
