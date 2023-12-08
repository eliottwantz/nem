import { route } from '$lib/ROUTES'
import { safeDBCall } from '$lib/utils/error'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { cashOutSchema } from './chas-out-form-schema'

export const load = async ({ locals: { session, user, lang, db } }) => {
	if (!session || !user) throw redirect(302, route('/signin', { lang }))
	if (user.role !== 'teacher') throw redirect(302, route('/dashboard/profile', { lang }))
	const res = await safeDBCall(
		db.teacher.findUnique({
			where: { id: user.id }
		})
	)
	if (!res.ok) throw redirect(302, route('/dashboard/profile', { lang }))
	const form = await superValidate<typeof cashOutSchema>(cashOutSchema)
	return {
		teacher: res.value,
		form
	}
}

export const actions = {
	cashOut: async ({ request }) => {
		const form = await superValidate(request, cashOutSchema)
		console.log('POST', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		return {
			form
		}
	}
}
