import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export const ssr = false

export async function load({ locals: { session, user }, params, fetch }) {
	console.log('In class load')
	if (!session || !user) throw redirect(302, '/')

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

	const res = await safeFetch(
		fetchers.classService(fetch, session).showClassDetails({ classId: params.id })
	)
	if (!res.ok) {
		throw redirect(302, disconnectUrl)
	}
	return {
		user,
		classDetails: res.data.classDetails,
		disconnectUrl
	}
}
