import { route } from '$lib/ROUTES'
import type { ServerMessage } from '$lib/schemas/error'
import { deleteAvatar, uploadAvatar } from '$lib/server/backblaze'
import { fail, redirect } from '@sveltejs/kit'

export async function load({ locals: { session } }) {
	console.log('profile edit server load')
	if (!session) throw redirect(302, '/signin')
}

export const actions = {
	updateAvatar: async ({ request, locals: { db, user, session } }) => {
		if (!user || !session) throw redirect(302, '/signin')
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
			const filePath = `avatars/${user.id}__${Math.random()}.${fileExt}`

			if (user.avatarFilePath) {
				// Delete old avatar
				await deleteAvatar(user.avatarFilePath)
			}

			// Create new avatar
			const avatarUrl = await uploadAvatar(avatar, filePath)
			if (!avatarUrl) {
				return fail(500, {
					text: 'Error uploading avatar',
					type: 'error'
				} satisfies ServerMessage)
			}

			try {
				await db.profile.update({
					where: { id: user.id },
					data: {
						avatarUrl,
						avatarFilePath: filePath
					}
				})
			} catch (e) {
				return fail(500, {
					text: e instanceof Error ? e.message : 'Something went wrong',
					type: 'error'
				} satisfies ServerMessage)
			}

			return {
				type: 'success',
				text: 'Avatar updated'
			} satisfies ServerMessage
		}
	},
	deleteAvatar: async ({ locals: { db, user, session, lang } }) => {
		if (!session || !user) throw redirect(302, route('/signin', { lang }))
		if (!user.avatarFilePath) return
		try {
			await Promise.all([
				deleteAvatar(user.avatarFilePath),
				db.profile.update({
					where: { id: user.id },
					data: { avatarFilePath: null, avatarUrl: null }
				})
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
