<script lang="ts">
	import { page } from '$app/stores'
	import { availableLanguageTags, setLanguageTag, type AvailableLanguageTag } from 'i18n/runtime'
	import type { ChangeEventHandler } from 'svelte/elements'

	const updateLang: ChangeEventHandler<HTMLSelectElement> = (e) => {
		const lang = e.currentTarget.value as AvailableLanguageTag
		setLanguageTag(() => lang)
	}
</script>

<div class="flex items-center space-x-1">
	<div>
		<select class="select" on:change={updateLang} value={$page.data.locale}>
			{#each availableLanguageTags as locale}
				<option selected={locale === $page.data.locale} value={locale}>
					{locale}
				</option>
			{/each}
		</select>
	</div>
</div>
