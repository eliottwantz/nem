import { fetchers, safeFetch } from '$lib/api'
import type { Class, TimeSlot } from '$lib/api/api.gen'
import { error, redirect } from '@sveltejs/kit'

export async function load({ params, fetch, locals: { session, user } }) {
	if (!session || !user) throw redirect(302, '/signin')
	if (user.role === 'teacher') throw redirect(302, '/dashboard/teacher/classes')

	const res = await safeFetch(
		fetchers.teacherService(fetch, session).findTeacherByID({ id: params.id })
	)
	if (!res.ok) {
		console.log(res.error)
		throw error(res.error.status, 'Teacher not found')
	}
	return {
		user,
		teacher: res.data.teacher,
		isFirstClass: new Promise<boolean>((resolve) => {
			safeFetch(
				fetchers.teacherService(fetch, session).findStudentOfTeacher({
					studentId: user.id,
					teacherId: params.id
				})
			).then((res) => {
				if (!res.ok) resolve(true)
				else resolve(false)
			})
		}),
		hoursBank: new Promise<number>((resolve) => {
			safeFetch(
				fetchers.studentService(fetch, session).getHoursBankForTeacher({
					teacherId: params.id
				})
			).then((res) => {
				if (res.ok) resolve(res.data.hours)
				else resolve(0)
			})
		}),
		streamed: {
			availabilities: new Promise<TimeSlot[]>((resolve) => {
				safeFetch(
					fetchers
						.studentService(fetch, session)
						.listAvailabilitiesOfTeacher({ teacherId: params.id })
				).then((res) => {
					if (res.ok) resolve(res.data.timeSlots)
					else resolve([])
				})
			}),
			classes: new Promise<Class[]>((resolve) => {
				safeFetch(
					fetchers
						.teacherService(fetch, session)
						.listClassesOfTeacher({ teacherId: params.id })
				).then((res) => {
					if (res.ok) resolve(res.data.classes)
					else resolve([])
				})
			})
		}
	}
}
