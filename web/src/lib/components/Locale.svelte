<script lang="ts">
	import { userStore } from '$lib/stores/user'
	import type { ComponentType } from 'svelte'
	import { locale, locales } from 'svelte-i18n'

	let selectedLang: string = $locale || 'en'

	// async function updateLang(lang: string) {
	// 	if (!$userStore) return
	// 	const user = $userStore

	// 	if (user.preferedLanguage === lang) return

	// 	try {
	// 		const res = await fetch('/dashboard/profile/updatePreferedLanguage/' + lang, {
	// 			method: 'POST'
	// 		})
	// 		const data = await res.text()
	// 		if (!res.ok) console.log(data)
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }

	$: console.log('$locale', $locale)
	$: console.log('Locale uiLang', selectedLang)
	$: {
		locale.set(selectedLang)
		// updateLang(selectedLang)
	}
</script>

<div class="flex items-center space-x-1">
	<div>
		<select class="select" bind:value={selectedLang}>
			{#each $locales as _locale}
				<option value={_locale}>
					{_locale}
				</option>
			{/each}
		</select>
	</div>
</div>
