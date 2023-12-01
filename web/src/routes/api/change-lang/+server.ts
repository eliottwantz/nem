import type { AvailableLanguageTag } from '$i18n/paraglide/runtime'
import { safeDBCall } from '$lib/utils/error'
import { json } from '@sveltejs/kit'

export const PUT = async ({ locals: { session, user, db }, request, cookies }) => {
	if (!session || !user) return json({ message: 'Unauthorized' }, { status: 401 })

	const req = (await request.json()) as { lang: AvailableLanguageTag }
	const res = await safeDBCall(
		db.profile.update({
			where: { id: user.id },
			data: { preferedLanguage: req.lang }
		})
	)
	if (!res.ok) {
		console.log(res.error)
		return json({ message: 'Could not update language preference' }, { status: 500 })
	}

	cookies.set('lang', req.lang, { path: '/' })

	return json({ message: 'Language preference changed' })
}
