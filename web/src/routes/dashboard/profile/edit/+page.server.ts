import { fetchers, safeFetch } from '$lib/api'
import type { ServerMessage } from '$lib/schemas/error'
import { newPasswordSchema } from '$lib/schemas/newPasswordSchema'
import { issuesToString } from '$lib/utils/zodError'
import { fail, redirect, type Actions } from '@sveltejs/kit'

export async function load({ locals: { user } }) {
	console.log('profile edit server load')
	if (!user) throw redirect(302, '/login')
	return {
		user
	}
}

export const actions = {
	changePass: async ({ request, locals: { supabase, user, session } }) => {
		debugger
		const formData = Object.fromEntries(await request.formData())

		const parseRes = newPasswordSchema.safeParse(formData)
		if (!parseRes.success) {
			return fail(400, {
				text: issuesToString(parseRes.error.issues),
				type: 'error'
			} satisfies ServerMessage)
		}

		const { error } = await supabase.auth.updateUser({
			password: parseRes.data.newPassword
		})
		if (error) {
			return fail(500, {
				text: error.message,
				type: 'error'
			} satisfies ServerMessage)
		}

		return {
			text: 'Password changed',
			type: 'success'
		} satisfies ServerMessage
	},
	updateAvatar: async ({ request, fetch, locals: { supabase, user, session } }) => {
		if (!user || !session) throw redirect(302, '/login')
		const formData = await request.formData()
		const avatar = formData.get('avatar')
		if (!avatar) {
			return fail(400, {
				text: 'No avatar selected',
				type: 'error'
			} satisfies ServerMessage)
		}
		if (!(avatar instanceof File)) {
			return fail(400, {
				text: 'Invalid avatar',
				type: 'error'
			} satisfies ServerMessage)
		} else {
			if (avatar.size === 0) {
				return fail(400, {
					text: 'You must select an image',
					type: 'error'
				} satisfies ServerMessage)
			}
			const fileExt = avatar.name.split('.').pop()
			const filePath = `${user.id}/${user.id}__${Math.random()}.${fileExt}`

			if (user.avatarFilePath) {
				// Delete old avatar
				const { error } = await supabase.storage
					.from('avatars')
					.remove([user.avatarFilePath])
				if (error) {
					return fail(500, {
						text: error.message,
						type: 'error'
					} satisfies ServerMessage)
				}
			}

			// Create new avatar
			const { error } = await supabase.storage.from('avatars').upload(filePath, avatar)
			if (error) {
				return fail(500, {
					text: error.message,
					type: 'error'
				} satisfies ServerMessage)
			}

			const {
				data: { publicUrl }
			} = supabase.storage.from('avatars').getPublicUrl(filePath)
			const res = await safeFetch(
				fetchers
					.userService(fetch, session)
					.updateAvatar({ path: filePath, url: publicUrl })
			)
			if (!res.ok) {
				return fail(500, {
					text: res.cause,
					type: 'error'
				} satisfies ServerMessage)
			}

			return {
				type: 'success',
				text: 'Avatar updated'
			} satisfies ServerMessage
		}
	},
	deleteAvatar: async ({ request, fetch, locals: { supabase, user, session } }) => {
		if (!session || !user) throw redirect(302, '/login')
		try {
			await Promise.all([
				supabase.storage.from('avatars').remove([user.avatarFilePath]),
				fetchers.userService(fetch, session).deleteAvatar({ path: user.avatarFilePath })
			])
			return {
				text: 'Avatar deleted',
				type: 'success'
			} satisfies ServerMessage
		} catch (error) {
			console.log(error)
			return {
				text: (error as Error).message,
				type: 'error'
			} satisfies ServerMessage
		}
	}
}
