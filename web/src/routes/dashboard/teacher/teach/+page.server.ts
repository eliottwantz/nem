import { fetchers, safeFetch } from '$lib/api'
import { fail, redirect } from '@sveltejs/kit'

export async function load({ locals: { session }, fetch }) {
	if (!session) throw redirect(302, '/login')
	const streams = await Promise.all([
		safeFetch(fetchers.classService(fetch, session).listLanguages()),
		safeFetch(fetchers.classService(fetch, session).listTopics()),
		safeFetch(fetchers.teacherService(fetch, session).listTopicsTaught())
	])
	return {
		languages: streams[0].ok ? streams[0].data.languages : [],
		topics: streams[1].ok ? streams[1].data.topics : [],
		topicsTaught: streams[2].ok ? streams[2].data.topicsTaught : []
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
			fetchers.teacherService(fetch, session).teach({
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
	}
}
