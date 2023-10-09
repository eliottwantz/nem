import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session }, fetch, params }) {
	if (!session) throw redirect(302, '/login')
	const res = await safeFetch(
		fetchers.classService(fetch, session).showClassDetails({ classId: params.id })
	)
	if (!res.ok) {
		console.log(res.error)
		throw redirect(302, '/dashboard/teacher/classes?notFound=' + params.id)
	}
	console.log(res.data.classDetails)
	return {
		classDetails: res.data.classDetails
	}
}
