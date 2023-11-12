import type { Cookies } from '@sveltejs/kit'
import { availableLanguageTags, sourceLanguageTag, type AvailableLanguageTag } from 'i18n/runtime'
import { writable } from 'svelte/store'

import * as m from 'i18n/messages'
export { m }

export function localeFromURL(url: URL): AvailableLanguageTag {
	const urlParts = url.pathname.split('/').splice(1)
	const locale = urlParts[0]
	return locale as AvailableLanguageTag
}

export function urlWithLocale(url: URL, cookies: Cookies): URL {
	const urlParts = url.pathname.split('/').splice(1)
	const locale = urlParts[0]
	if (!availableLanguageTags.includes(locale as AvailableLanguageTag)) {
		const localeCookie = cookies.get('locale')
		if (!localeCookie) {
			urlParts.unshift(sourceLanguageTag)
		} else {
			urlParts.unshift(localeCookie)
		}
		return new URL(`${url.origin}/${urlParts.join('/')}${url.search}`)
	} else {
		return url
	}
}

export function urlWithoutLocale(url: URL): URL {
	const urlParts = url.pathname.split('/').splice(1)
	return new URL(`${url.origin}/${urlParts.join('/')}${url.search}`)
}

export function pathNameWithoutLocale(url: URL): string {
	const urlParts = url.pathname.split('/').splice(2)
	return `/${urlParts.join('/')}`
}

export const dir = writable<'ltr' | 'rtl'>('ltr')
