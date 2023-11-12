<script lang="ts">
	import { page } from '$app/stores'
	import { onSetLanguageTag, setLanguageTag } from 'i18n/runtime'
	import { getContext, setContext } from 'svelte'

	setContext('languageTag', $page.data.locale)
	setLanguageTag(() => getContext('languageTag'))

	if (import.meta.env.SSR === false) {
		onSetLanguageTag((newLanguageTag) => {
			const urlParts = $page.url.pathname.split('/').splice(1)
			urlParts.shift()
			urlParts.unshift(newLanguageTag)
			window.location.href = `${$page.url.origin}/${urlParts.join('/')}${$page.url.search}`
		})
	}
</script>

<svelte:head>
	<base href="http://localhost:5173/{$page.data.locale}/" />
</svelte:head>
<slot />
