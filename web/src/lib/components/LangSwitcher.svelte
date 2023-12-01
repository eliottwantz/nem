<script lang="ts">
	import { page } from '$app/stores'
	import { translatePath } from '$i18n'
	import {
		availableLanguageTags,
		sourceLanguageTag,
		type AvailableLanguageTag
	} from '$i18n/paraglide/runtime'
	import { goto } from '$app/navigation'
	import { ListBox, ListBoxItem, popup, type PopupSettings } from '@skeletonlabs/skeleton'
	import { safeFetch } from '$lib/api'

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'top'
	}

	async function changeLang(lang: AvailableLanguageTag) {
		if (!$page.data.user) {
			await goto(translatePath($page.url.pathname, lang))
			return
		} else {
			await Promise.all([
				await safeFetch(
					fetch('/api/change-lang', {
						method: 'POST',
						body: JSON.stringify({ lang })
					})
				),
				goto(translatePath($page.url.pathname, lang))
			])
		}
	}

	let selectedLang = $page.params.lang ?? sourceLanguageTag
</script>

<div>
	<button class="variant-ghost-surface btn" use:popup={popupClick}>{selectedLang}</button>

	<div class="card p-4" data-popup="popupClick">
		<ListBox>
			{#each availableLanguageTags as lang}
				<ListBoxItem
					on:click={() => changeLang(lang)}
					bind:group={selectedLang}
					name={lang}
					value={lang}>{lang}</ListBoxItem
				>
			{/each}
		</ListBox>
	</div>
</div>
