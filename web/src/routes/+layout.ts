import { browser } from '$app/environment'
import { defaultLocale } from '$lib/i18n'
import { locale, waitLocale } from 'svelte-i18n'
import { get } from 'svelte/store'

export async function load({ data }) {
	console.log('layout.ts ran')

	const user = data.user
	if (browser) {
		let lang = defaultLocale
		if (user && user.preferedLanguage) {
			console.log('user lang in browser', user.preferedLanguage)
			lang = user.preferedLanguage
		}
		console.log('layout.ts lang', lang)
		locale.set(lang)
		locale.set(lang)
		console.log('layout.ts locale', get(locale))
	}
	await waitLocale()
	console.log('layout.ts locale after wait', get(locale))

	return { user, session: data.session }
}
