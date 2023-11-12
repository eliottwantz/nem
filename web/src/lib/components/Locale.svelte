<script lang="ts">
	import { userStore } from '$lib/stores/user'
	import { availableLanguageTags } from 'i18n/runtime'
	import type { ComponentType } from 'svelte'

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

	let selectedLang: string
</script>

<div class="flex items-center space-x-1">
	<div>
		<select class="select" bind:value={selectedLang}>
			{#each availableLanguageTags as locale}
				<option value={locale}>
					{locale}
				</option>
			{/each}
		</select>
	</div>
</div>
