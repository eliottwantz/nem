import { safeFetch, fetchers } from '$lib/api'
import { error, json } from '@sveltejs/kit'

export async function POST({ locals: { session }, params }) {
	if (!session) throw error(401, 'Unauthorized haha')

	const res = await safeFetch(
		fetchers.userService(fetch, session).updatePreferedLanguage({
			lang: params.lang
		})
	)
	if (!res.ok) {
		console.log(res.error)
		throw error(res.error.status, res.cause)
	}

	return new Response()
}
