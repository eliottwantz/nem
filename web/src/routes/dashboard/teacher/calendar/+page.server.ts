import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export async function load({ locals: { session }, fetch }) {
	if (!session) throw redirect(302, '/login')

	const streams = await Promise.all([
		safeFetch(
			fetchers
				.teacherService(fetch, session)
				.listClassesOfTeacher({ teacherId: session.user.id })
		),
		safeFetch(
			fetchers
				.teacherService(fetch, session)
				.listAvailabilities({ teacherId: session.user.id })
		)
	])
	return {
		success: streams[0].ok && streams[1].ok,
		message: !streams[0].ok ? streams[0].cause : !streams[1].ok ? streams[1].cause : '',
		classes: streams[0].ok ? streams[0].data.classes : [],
		availabilities: streams[1].ok ? streams[1].data.timeSlots : []
	}
}
