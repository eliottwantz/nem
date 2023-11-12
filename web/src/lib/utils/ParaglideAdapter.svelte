<script lang="ts">
	import { page } from '$app/stores'
	import { onSetLanguageTag, setLanguageTag } from 'i18n/runtime'
	import { getContext, setContext } from 'svelte'

	setContext('languageTag', $page.params.lang)

	setLanguageTag(() => getContext('languageTag'))

	if (import.meta.env.SSR === false) {
		onSetLanguageTag((newLanguageTag) => {
			const urlParts = $page.url.pathname.split('/').splice(1)
			urlParts.shift()
			urlParts.unshift(newLanguageTag)
			const newUrl = `${$page.url.origin}/${urlParts.join('/')}${$page.url.search}`
			window.location.href = newUrl
		})
	}
</script>

<slot />
