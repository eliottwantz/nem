import { fetchers, safeFetch } from '$lib/api'

export async function load({ locals: { session, redirect }, fetch, params }) {
	if (!session) throw redirect(302, '/signin')
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
