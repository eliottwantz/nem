import {
	availableLanguageTags,
	type AvailableLanguageTag,
	sourceLanguageTag,
	languageTag
} from 'i18n/runtime'
import { readable, writable } from 'svelte/store'

export function localeFromURL(url: URL): AvailableLanguageTag {
	const urlParts = url.pathname.split('/').splice(1)
	const locale = urlParts[0]
	return locale as AvailableLanguageTag
}

export function urlWithLocale(url: URL): URL {
	const urlParts = url.pathname.split('/').splice(1)
	const locale = urlParts[0]
	if (!availableLanguageTags.includes(locale as AvailableLanguageTag)) {
		urlParts.unshift(sourceLanguageTag)
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
