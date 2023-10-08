import { fetchers, safeFetch } from '$lib/api'
import { fail, redirect, type Actions } from '@sveltejs/kit'

export async function load({ locals: { user } }) {
	console.log('profile edit server load')
	if (!user) throw redirect(302, '/login')
	return { user }
}

export const actions: Actions = {
	updateAvatar: async (event) => {
		const {
			request,
			fetch,
			locals: { supabase, user, session }
		} = event
		if (!user || !session) throw redirect(302, '/login')
		const formData = await request.formData()
		const avatar = formData.get('avatar')
		if (!avatar) {
			return fail(400, {
				message: 'No avatar selected',
				success: false
			})
		}
		if (!(avatar instanceof File)) {
			return fail(400, {
				message: 'Invalid avatar',
				success: false
			})
		} else {
			if (avatar.size === 0) {
				return fail(400, {
					message: 'You must select an image',
					success: false
				})
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
						message: error.message,
						success: false
					})
				}
			}

			// Create new avatar
			const { error } = await supabase.storage.from('avatars').upload(filePath, avatar)
			if (error) {
				return fail(500, {
					message: error.message,
					success: false
				})
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
					message: res.cause,
					success: false
				})
			}

			return {
				success: true,
				message: 'Avatar updated'
			}
		}
	},
	deleteAvatar: async (event) => {
		const {
			locals: { supabase, session, user },
			fetch
		} = event
		if (!session || !user) throw redirect(302, '/login')
		try {
			await Promise.all([
				supabase.storage.from('avatars').remove([user.avatarFilePath]),
				fetchers.userService(fetch, session).deleteAvatar({ path: user.avatarFilePath })
			])
			return {
				message: 'Avatar deleted',
				success: true
			}
		} catch (error) {
			console.log(error)
			return {
				message: (error as Error).message,
				success: false
			}
		}
	}
}
