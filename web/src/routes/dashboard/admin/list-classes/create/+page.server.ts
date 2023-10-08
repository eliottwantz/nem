import { fetchers, safeFetch } from '$lib/api'
import type { Learn } from '$lib/api/api.gen'
import { createClassSchema } from '$lib/schemas/createClass'
import type { FormErrorMessage } from '$lib/schemas/error'
import { dateToISO, stringToISO } from '$lib/utils/datetime'
import { fail, redirect } from '@sveltejs/kit'
import { message, setError, superValidate } from 'sveltekit-superforms/server'

export async function load({ fetch, locals: { session } }) {
	if (!session) throw redirect(302, '/login')

	const form = await superValidate(createClassSchema)

	const res = await safeFetch(fetchers.classService(fetch, session).listAvailableLearns())
	if (!res.ok) {
		console.log(res.error)
		return {
			learns: [] as Learn[],
			form
		}
	}
	return {
		learns: res.data.learns,
		form
	}
}

export const actions = {
	default: async ({ request, fetch, locals: { session } }) => {
		if (!session) throw redirect(302, '/login')
		const form = await superValidate<typeof createClassSchema, FormErrorMessage>(
			request,
			createClassSchema
		)
		console.log('POST register', form)
		return message(form, { type: 'error', text: 'Not implemented yet' })

		if (!form.valid) return fail(400, { form })

		// 1 hour class
		const endAt = new Date(form.data.startAt)
		endAt.setHours(endAt.getHours() + 1)

		const res = await safeFetch(
			fetchers.adminService(fetch, session).adminCreateClass({
				req: {
					name: form.data.name,
					learnId: parseInt(form.data.learnId),
					start_at: stringToISO(form.data.startAt),
					end_at: dateToISO(endAt),
					userIDs: form.data.userIDs
				}
			})
		)
		if (!res.ok) {
			console.log(res.error)
			return message(form, { type: 'error', text: res.cause })
		}

		return message(form, { type: 'success', text: 'Class created' })
	}
}
