import { wise } from '$lib/api/wise'
import { AppError } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export const GET = async ({ fetch }) => {
	const res = await wise(fetch).listProfiles()
	if (res instanceof AppError) {
		return new Response(res.message, { status: 500 })
	}

	return json(res)
}
