<script lang="ts">
	import '@event-calendar/core/index.css'
	import '@fontsource-variable/inter'
	import '../app.postcss'

	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import Avatar from '$lib/components/Avatar.svelte'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import Drawer from '$lib/components/Drawer/Drawer.svelte'
	import Locale from '$lib/components/Locale.svelte'
	import { modalComponentRegistry } from '$lib/components/Modal'
	import Navigation from '$lib/components/Navigation.svelte'
	import StudentSidebar from '$lib/components/Sidebar/StudentSidebar.svelte'
	import TeacherSidebar from '$lib/components/Sidebar/TeacherSidebar.svelte'
	import Logo from '$lib/icons/Logo.svelte'
	import { userStore } from '$lib/stores/user'
	import { getInitials } from '$lib/utils/initials'
	import {
		AppBar,
		AppShell,
		Modal,
		Toast,
		getDrawerStore,
		initializeStores
	} from '@skeletonlabs/skeleton'
	import { Hourglass } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import ParaglideAdapter from '$lib/ParaglideAdapter.svelte'

	export let data
	initializeStores()
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

	$: if (browser && data.user) userStore.set(data.user)
	$: console.log('LAYOUT userStore', $userStore)
	// $: if (browser) document.dir = $dir
	// $: if (browser && data.session && !ws.socket) ws.Connect()
</script>

<ParaglideAdapter>
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
						<a href="/">
							<div class="flex items-center space-x-4">
								<Logo />
								<h1 id="nem" class="h3 hidden items-center lg:flex">NEM</h1>
							</div>
						</a>
					</div>
				</svelte:fragment>

				<!-- Main part -->
				<div class="hidden lg:block">
					<Navigation horizontal />
				</div>
				<a href="/">
					<h1 id="nem" class="text-center text-2xl lg:hidden">NEM</h1>
				</a>
				<svelte:fragment slot="trail">
					{#if $page.url.pathname.startsWith('/teachers/') && $page.url.pathname.at(-1) !== 's'}
						<div id="hoursBank" class="flex flex-wrap items-center justify-center">
							<span class="text-xl">{$page.data.hoursBank}h</span>
							<Hourglass />
						</div>
					{/if}
					<div class="hidden lg:block">
						<Locale />
					</div>
					{#if !data.session}
						<a href="/signin" role="button" class="variant-filled-primary btn">
							Signin
						</a>
					{:else if !$userStore}
						<a href="/signout" role="button" class="variant-filled-primary btn">
							Signout
						</a>
					{:else}
						<a href="/dashboard/profile">
							<Avatar
								class="cursor-pointer hover:border-primary-500"
								src={$userStore.avatarUrl ?? ''}
								initials={getInitials($userStore.firstName, $userStore.lastName)}
							/>
						</a>
					{/if}
				</svelte:fragment>
			</AppBar>
		</svelte:fragment>

		<svelte:fragment slot="sidebarLeft">
			{#if $userStore}
				{#if $userStore?.role === 'teacher'}
					<TeacherSidebar />
				{:else}
					<StudentSidebar />
				{/if}
			{/if}
		</svelte:fragment>

		<!-- Router Slot -->
		<slot />
	</AppShell>
</ParaglideAdapter>

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
