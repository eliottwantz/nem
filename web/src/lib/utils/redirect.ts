import { redirect } from '@sveltejs/kit'
import { sourceLanguageTag, type AvailableLanguageTag } from '$i18n/paraglide/runtime'

export type AppRedirect = ReturnType<typeof appRedirect>

export function appRedirect(locale: AvailableLanguageTag) {
	return (status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308, location: string) => {
		if (locale === sourceLanguageTag) return redirect(status, location)
		const newURL = addLocaleToURL(location, locale)
		return redirect(status, newURL)
	}
}

function addLocaleToURL(url: string, langTag: AvailableLanguageTag): string {
	return `/${langTag}${url}`
}
