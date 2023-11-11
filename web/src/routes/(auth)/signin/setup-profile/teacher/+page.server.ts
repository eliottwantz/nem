import { fetchers, safeFetch } from '$lib/api'
import type { ServerMessage } from '$lib/schemas/error'
import { createTeacherSchema } from '$lib/schemas/profile'
import { safeDBCall } from '$lib/utils/error'
import { fail, redirect } from '@sveltejs/kit'
import { message, superValidate } from 'sveltekit-superforms/server'

export const load = async ({ locals: { session, user, db }, fetch }) => {
	console.log('setup profile page.server load')
	if (!session) throw redirect(302, '/')
	if (user) {
		console.log('user already created his profile')
		throw redirect(302, '/dashboard/profile')
	}

	// const resAsync = ResultAsync.fromPromise(
	// 	db.language.findMany(),
	// 	() => new AppError('Could not load languages')
	// )
	// const res = await resAsync
	// if (res.isErr()) {
	// 	console.log(res.error, res.error.metadata)
	// } else {
	// 	console.log('Languages:', res.value)
	// }
	{
		const res = await safeDBCall(db.language.findMany())
		if (res.ok) {
			console.log('Languages SAFEDBCALL:', res.value)
		} else {
			res.error
		}
	}
	{
		const res = await safeDBCall(db.topic.findMany())
		if (res.ok) {
			console.log('Topics SAFEDBCALL:', res.value)
		} else {
			res.error
		}
	}

	const streams = await Promise.all([
		safeDBCall(db.language.findMany()),
		safeDBCall(db.topic.findMany())
	])

	const form = await superValidate(createTeacherSchema)

	return {
		form,
		languages: streams[0].ok ? streams[0].value.map((l) => l.language) : [],
		topics: streams[1].ok ? streams[1].value.map((t) => t.topic) : []
	}
}

export const actions = {
	default: async ({ request, locals: { session, db } }) => {
		if (!session) throw redirect(302, '/signin')
		debugger
		const form = await superValidate<typeof createTeacherSchema, ServerMessage>(
			request,
			createTeacherSchema
		)
		console.log('POST setup-profile', form)

		if (!form.valid) {
			return fail(400, { form })
		}

		if (form.data.spokenLanguages.length === 0) {
			return message(form, { type: 'error', text: 'Please select your spoken languages' })
		}

		// Use interactive transaction: https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions
		const res = await safeDBCall(
			db.$transaction([
				db.profile.create({
					data: {
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						role: 'teacher',
						preferedLanguage: form.data.preferedLanguage,
						user: { connect: { id: session.user.id } }
					}
				}),
				db.teacher.create({
					data: {
						bio: form.data.bio,
						hourRate: form.data.hourRate,
						user: { connect: { id: session.user.id } }
					}
				})
			])
		)
		if (!res.ok) {
			console.log(res.error)
			return message(form, { type: 'error', text: res.error.message })
		}

		const [profileRes, teacherRes] = res.value
		console.log('profileRes:', profileRes, 'teacherRes:', teacherRes)

		throw redirect(302, '/dashboard/profile')
	}
}
