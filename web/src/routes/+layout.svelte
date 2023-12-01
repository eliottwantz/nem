<script lang="ts">
	import '@event-calendar/core/index.css'
	import '@fontsource-variable/inter'
	import '@fontsource/gravitas-one'
	import '../app.postcss'

	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import { m, translatePath } from '$i18n'
	import {
		availableLanguageTags,
		setLanguageTag,
		sourceLanguageTag,
		type AvailableLanguageTag
	} from '$i18n/paraglide/runtime'
	import Avatar from '$lib/components/Avatar.svelte'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import Drawer from '$lib/components/Drawer/Drawer.svelte'
	import { modalComponentRegistry } from '$lib/components/Modal'
	import Navigation from '$lib/components/Navigation.svelte'
	import StudentSidebar from '$lib/components/Sidebar/StudentSidebar.svelte'
	import TeacherSidebar from '$lib/components/Sidebar/TeacherSidebar.svelte'
	import Logo from '$lib/icons/Logo.svelte'
	import { getInitials } from '$lib/utils/initials'
	import { ws } from '$lib/ws'
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
	import {
		AppBar,
		AppShell,
		Modal,
		Toast,
		getDrawerStore,
		initializeStores,
		storePopup
	} from '@skeletonlabs/skeleton'
	import { Hourglass } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import LangSwitcher from '$components/LangSwitcher.svelte'
	import Link from '$components/Link.svelte'

	export let data
	initializeStores()
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow })
	const drawerStore = getDrawerStore()

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
	$: if (browser && data.session && !ws.socket) ws.Connect()

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
	<AppShell slotSidebarLeft="lg:block hidden">
		<svelte:fragment slot="header">
			<!-- App Bar -->
			<AppBar shadow="shadow-lg">
				<svelte:fragment slot="lead">
					<div class="flex items-center space-x-4">
						<!-- Leftslider Menu Icon -->
						<button
							class="btn-icon btn-icon-sm lg:!hidden"
							on:click={() =>
								drawerStore.open({
									id: drawerStoreIds.sidebar
								})}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M3 18v-2h18v2H3Zm0-5v-2h18v2H3Zm0-5V6h18v2H3Z"
								/>
							</svg>
						</button>
						<Link href="/">
							<div class="flex items-center space-x-4">
								<Logo />
								<h1 id="nem" class="h3 hidden items-center lg:flex">NEM</h1>
							</div>
						</Link>
					</div>
				</svelte:fragment>

				<!-- Main part -->
				<div class="hidden lg:block">
					<Navigation horizontal />
				</div>
				<Link href="/">
					<h1 id="nem" class="text-center text-2xl lg:hidden">NEM</h1>
				</Link>
				<svelte:fragment slot="trail">
					{#if $page.url.pathname.startsWith('/teachers/') && $page.url.pathname.at(-1) !== 's'}
						<div id="hoursBank" class="flex flex-wrap items-center justify-center">
							<span class="text-xl">{$page.data.hoursBank}h</span>
							<Hourglass />
						</div>
					{/if}
					<div class="hidden lg:block">
						<LangSwitcher />
					</div>
					{#if !data.session}
						<Link href="/signin" role="button" class="variant-filled-primary btn">
							Signin
						</Link>
					{:else if !data.user}
						<Link href="/signout" role="button" class="variant-filled-primary btn">
							{m.signout()}
						</Link>
					{:else}
						<Link href="/dashboard/profile">
							<Avatar
								class="cursor-pointer hover:border-primary-500"
								src={data.user.avatarUrl ?? ''}
								initials={getInitials(data.user)}
							/>
						</Link>
					{/if}
				</svelte:fragment>
			</AppBar>
		</svelte:fragment>

		<svelte:fragment slot="sidebarLeft">
			{#if data.user}
				{#if data.user.role === 'teacher'}
					<TeacherSidebar />
				{:else}
					<StudentSidebar />
				{/if}
			{/if}
		</svelte:fragment>

		<!-- Router Slot -->
		<slot />
	</AppShell>
{/key}

<style type="postcss">
	#nem {
		font-family: 'Gravitas One', cursive;
	}

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
