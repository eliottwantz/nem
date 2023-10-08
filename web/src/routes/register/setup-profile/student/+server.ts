import { fetchers, safeFetch } from '$lib/api'
import type { FormErrorMessage } from '$lib/schemas/error'
import { createStudentSchema } from '$lib/schemas/profile'
import { issuesToString } from '$lib/utils/zodError'
import { json, redirect } from '@sveltejs/kit'

export async function POST({ request, fetch, locals: { session } }) {
	if (!session) throw redirect(302, '/login')
	try {
		const req = await request.json()
		console.log('POST setup-profile', req)

		const parseRes = createStudentSchema.safeParse(req)
		if (!parseRes.success) {
			return json(
				{
					type: 'error',
					text: issuesToString(parseRes.error.issues)
				} satisfies FormErrorMessage,
				{ status: 400 }
			)
		}

		const res = await safeFetch(
			fetchers.userService(fetch, session).createStudent({
				req: {
					firstName: parseRes.data.firstName,
					lastName: parseRes.data.lastName,
					email: session.user.email!,
					role: parseRes.data.role,
					preferedLanguage: parseRes.data.preferedLanguage
				}
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return json(
				{
					type: 'error',
					text: res.cause
				} satisfies FormErrorMessage,
				{ status: res.error.status }
			)
		}
		return json({}, { status: 201 })
	} catch (e) {
		return json(
			{
				type: 'error',
				text: e instanceof Error ? e.message : 'An unknown error occurred'
			} satisfies FormErrorMessage,
			{ status: 500 }
		)
	}
}
