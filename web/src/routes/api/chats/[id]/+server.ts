import { AppError, safeDBCall } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export const GET = async ({ locals: { db, user }, params }) => {
	if (!user) return new Response('Unauthorized', { status: 401 })

	const res = await safeDBCall(
		db.chat.findFirst({
			where: {
				users: {
					every: {
						id: {
							in: [user.id, params.id]
						}
					}
				}
			}
		})
	)
	if (res.ok) return json(res.value)
	else if (res.error instanceof AppError) return json(null)
	else {
		console.log(res.error)
		return json(null)
	}
}
