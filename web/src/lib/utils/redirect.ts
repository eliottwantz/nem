import { page } from '$app/stores'
import { redirect } from '@sveltejs/kit'
import type { AvailableLanguageTag } from 'i18n/runtime'
import { get } from 'svelte/store'

export type AppRedirect = typeof appRedirect
export function appRedirect(
	status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308,
	location: string,
	locale: AvailableLanguageTag
) {
	return redirect(status, _href(location, locale))
}

function _href(location: string, locale: AvailableLanguageTag) {
	let url = ''
	if (!location.startsWith('/')) {
		url = `/${locale}/${location}`
	} else {
		url = `/${locale}${location}`
	}
	return url
}

export function href(location: string) {
	return _href(location, get(page).data.locale)
}
