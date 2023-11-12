<script lang="ts">
	import { page } from '$app/stores'
	import { availableLanguageTags, setLanguageTag, type AvailableLanguageTag } from 'i18n/runtime'
	import type { ChangeEventHandler } from 'svelte/elements'

	const updateLang: ChangeEventHandler<HTMLSelectElement> = (e) => {
		const lang = e.currentTarget.value as AvailableLanguageTag
		setLanguageTag(lang)
		// if (!$userStore) return
		// const user = $userStore
		// if (user.preferedLanguage === lang) return
		// try {
		// 	const res = await fetch('/dashboard/profile/updatePreferedLanguage/' + lang, {
		// 		method: 'POST'
		// 	})
		// 	const data = await res.text()
		// 	if (!res.ok) console.log(data)
		// } catch (error) {
		// 	console.log(error)
		// }
	}
</script>

<div class="flex items-center space-x-1">
	<div>
		<select class="select" on:change={updateLang} value={$page.data.locale}>
			{#each availableLanguageTags as locale}
				<option value={locale}>
					{locale}
				</option>
			{/each}
		</select>
	</div>
</div>
