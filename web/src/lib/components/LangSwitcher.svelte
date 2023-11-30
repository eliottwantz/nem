<script lang="ts">
	import { page } from '$app/stores'
	import { translatePath } from '$i18n'
	import { availableLanguageTags, sourceLanguageTag } from '$i18n/paraglide/runtime'
	import { goto } from '$app/navigation'
	import { ListBox, ListBoxItem, popup, type PopupSettings } from '@skeletonlabs/skeleton'

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'top'
	}

	let selectedLang = $page.params.lang ?? sourceLanguageTag
</script>

<div>
	<button class="variant-ghost-surface btn" use:popup={popupClick}>{selectedLang}</button>

	<div class="card p-4" data-popup="popupClick">
		<ListBox>
			{#each availableLanguageTags as lang}
				<ListBoxItem
					on:click={() => goto(translatePath($page.url.pathname, lang))}
					bind:group={selectedLang}
					name={lang}
					value={lang}>{lang}</ListBoxItem
				>
			{/each}
		</ListBox>
	</div>
</div>
