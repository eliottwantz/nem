import { browser } from '$app/environment'
import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { fetchers, safeFetch } from '$lib/api'
import type { User } from '$lib/api/api.gen'
import { defaultLocale } from '$lib/i18n'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import { locale, waitLocale } from 'svelte-i18n'
import { get } from 'svelte/store'

export async function load({ data, depends, fetch }) {
	depends('supabase:auth')

	console.log('layout.ts ran')

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event: { fetch },
		serverSession: data.session
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	const user: User | null = data.user
	// let lang = defaultLocale
	// if (user && user.preferedLanguage) {
	// 	console.log('user lang in browser', user.preferedLanguage)
	// 	lang = user.preferedLanguage
	// }
	// console.log('lang', lang)
	// locale.set(lang)
	// await waitLocale()
	// console.log('locale', get(locale))
	// locale.set(lang)
	// console.log('locale after', get(locale))
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

	return { supabase, session, user }
}
