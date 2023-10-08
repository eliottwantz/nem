import { page } from '$app/stores'
import { getLocaleFromNavigator, init, isLoading, locale, register } from 'svelte-i18n'
import { derived, get } from 'svelte/store'

// Flags from : https://en.wiktionary.org/wiki/Wiktionary:Language_flags_list

export const defaultLocale = 'en'

register('en', () => import('./dicts/en.json'))
register('fr', () => import('./dicts/fr.json'))
register('ar', () => import('./dicts/ar.json'))

init({
	fallbackLocale: defaultLocale,
	initialLocale: getLocaleFromNavigator() || defaultLocale
})

const dir = derived(locale, ($locale) => ($locale === 'ar' ? 'rtl' : 'ltr'))

export { dir, isLoading }
