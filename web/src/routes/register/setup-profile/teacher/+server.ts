import { fetchers, safeFetch } from '$lib/api'
import type { FormErrorMessage } from '$lib/schemas/error'
import { createTeacherSchema } from '$lib/schemas/profile'
import { issuesToString } from '$lib/utils/zodError'
import { json, redirect } from '@sveltejs/kit'

export async function POST({ request, fetch, locals: { session } }) {
	if (!session) throw redirect(302, '/login')
	try {
		const req = await request.json()
		console.log('POST setup-profile', req)

		const parseRes = createTeacherSchema.safeParse(req)
		if (!parseRes.success) {
			return json(
				{
					type: 'error',
					text: issuesToString(parseRes.error.issues)
				} satisfies FormErrorMessage,
				{ status: 400 }
			)
		}

		if (!parseRes.data.spokenLanguages || parseRes.data.spokenLanguages.length === 0) {
			return json(
				{
					type: 'error',
					text: 'Please select your spoken languages'
				} satisfies FormErrorMessage,
				{ status: 400 }
			)
		}

		const res = await safeFetch(
			fetchers.userService(fetch, session).createTeacher({
				req: {
					firstName: parseRes.data.firstName,
					lastName: parseRes.data.lastName,
					email: session.user.email!,
					role: parseRes.data.role,
					preferedLanguage: parseRes.data.preferedLanguage,
					bio: parseRes.data.bio,
					hourRate: parseRes.data.hourRate,
					spokenLanguages: parseRes.data.spokenLanguages
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
		console.log(e)
		return json(
			{
				type: 'error',
				text: e instanceof Error ? e.message : 'An unknown error occurred'
			} satisfies FormErrorMessage,
			{ status: 500 }
		)
	}
}
