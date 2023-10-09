import { fetchers, safeFetch } from '$lib/api'
import { fail, redirect } from '@sveltejs/kit'

export async function load({ fetch, locals: { session }, url, depends }) {
	if (!session) throw redirect(302, '/login')
	let learnPromise = safeFetch(fetchers.classService(fetch, session).listAvailableLearns())

	const teacherId = url.searchParams.get('teacherId')
	if (teacherId) {
		learnPromise = safeFetch(
			fetchers.classService(fetch, session).listLearnsOfTeacher({ teacherId })
		)
	}

	const res = await Promise.all([
		learnPromise,
		safeFetch(fetchers.studentService(fetch, session).listLearns()),
		teacherId
			? safeFetch(fetchers.userService(fetch, session).findUserByID({ id: teacherId }))
			: null
	])
	return {
		learns: res[0].ok ? res[0].data.learns : [],
		userLearns: res[1].ok ? res[1].data.learns : [],
		selectedTeacher: res[2]?.ok ? res[2].data.user : undefined
	}
}

export const actions = {
	async default({ request, locals: { session }, fetch }) {
		if (!session) throw redirect(302, '/login')
		const { language, topic } = Object.fromEntries(await request.formData()) as {
			language: string
			topic: string
		}
		if (!language || !topic)
			return fail(400, {
				success: false,
				message: 'Invalid form data'
			})

		const res = await safeFetch(
			fetchers.studentService(fetch, session).learn({
				language: language,
				topic: topic
			})
		)

		if (!res.ok) {
			console.log(res.error)
			return fail(res.error.code, {
				success: false,
				message: res.cause
			})
		}

		console.log(res.data.learn)
	}
}
