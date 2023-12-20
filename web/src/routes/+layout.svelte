<script lang="ts">
	import '@event-calendar/core/index.css'
	import '@fontsource-variable/inter'
	import '@fontsource/gravitas-one'
	import '../app.postcss'

	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import { translatePath } from '$i18n'
	import {
		availableLanguageTags,
		setLanguageTag,
		sourceLanguageTag,
		type AvailableLanguageTag
	} from '$i18n/paraglide/runtime'
	import Drawer from '$lib/components/Drawer/Drawer.svelte'
	import { modalComponentRegistry } from '$lib/components/Modal'
	import { ws } from '$lib/ws'
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
	import {
		Modal,
		Toast,
		getDrawerStore,
		initializeStores,
		storePopup
	} from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	export let data
	initializeStores()
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow })

	onMount(() => {
		import('emoji-picker-element')
	})

	onNavigate((navigation) => {
		//@ts-expect-error
		if (!document.startViewTransition) return

		return new Promise((resolve) => {
			//@ts-expect-error
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})

	$: console.log('LAYOUT user', $page.data.user)
	$: if (browser && data.user && !ws.socket) ws.Connect()

	$: lang = ($page.params.lang as AvailableLanguageTag) ?? sourceLanguageTag
	$: setLanguageTag(lang)
	$: if (browser) document.documentElement.lang = lang
	$: if (browser) document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
</script>

<svelte:head>
	{#each availableLanguageTags as lang}
		<link rel="alternate" hreflang={lang} href={translatePath($page.url.pathname, lang)} />
	{/each}
</svelte:head>

{#key lang}
	<Drawer />

	<Toast />

	<Modal zIndex="z-[9999]" components={modalComponentRegistry} />

	<div id="nem-rectangle-middle"></div>
	<slot />
{/key}

<style type="postcss">
	#nem-rectangle-middle {
		position: fixed;
		top: 0;
		right: 50%;
		left: 50%; /* Center horizontally */
		transform: translateX(-50%); /* Center horizontally */
		width: 2rem;
		height: 100%;
		background-color: #fbdd9005; /* Barely visible background color */
		z-index: -1; /* Place it behind the content */
	}
</style>
