import { page } from '$app/stores'
import * as m from '$i18n/paraglide/messages'
import {
	availableLanguageTags,
	sourceLanguageTag,
	type AvailableLanguageTag
} from '$i18n/paraglide/runtime'
import { get } from 'svelte/store'
export { m }

export const currLang = () => (get(page).params.lang as AvailableLanguageTag) ?? sourceLanguageTag
export const langParams = () => {
	const currLang = (get(page).params.lang as AvailableLanguageTag) ?? sourceLanguageTag
	return { lang: currLang !== sourceLanguageTag ? currLang : undefined }
}

/**
 * Returns the path in the given language, regardless of which language the path is in.
 */
export function translatePath(path: string, lang: AvailableLanguageTag) {
	path = withoutLanguageTag(path)

	// Don't prefix the default language
	if (lang === sourceLanguageTag) {
		if (path === '/') return '/'
		return `/${path}`
	}

	// Prefix all other languages
	return `/${lang}${path}`
}

/**
 * Returns the path without the language tag
 */
export function withoutLanguageTag(path: string) {
	const [_, maybeLang, ...rest] = path.split('/')
	if (!maybeLang) return ''
	if (availableLanguageTags.includes(maybeLang as AvailableLanguageTag)) {
		return rest.join('/')
	}
	return path
}
