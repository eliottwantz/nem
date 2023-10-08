<script lang="ts">
	import '@event-calendar/core/index.css'
	import '../app.postcss'

	import { browser } from '$app/environment'
	import { invalidate } from '$app/navigation'
	import { ws } from '$lib/api/ws'
	import Avatar from '$lib/components/Avatar.svelte'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import Drawer from '$lib/components/Drawer/Drawer.svelte'
	import Locale from '$lib/components/Locale.svelte'
	import { modalComponentRegistry } from '$lib/components/Modal'
	import Navigation from '$lib/components/Navigation.svelte'
	import AdminSidebar from '$lib/components/Sidebar/AdminSidebar.svelte'
	import StudentSidebar from '$lib/components/Sidebar/StudentSidebar.svelte'
	import TeacherSidebar from '$lib/components/Sidebar/TeacherSidebar.svelte'
	import { dir } from '$lib/i18n'
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
	import { onMount } from 'svelte'
	import { t } from 'svelte-i18n'
	import { onNavigate } from '$app/navigation'

	export let data
	initializeStores()
	const drawerStore = getDrawerStore()

	let { supabase, session } = data
	$: ({ supabase, session } = data)

	onMount(() => {
		import('unicode-emoji-picker')
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})

		return () => data.subscription.unsubscribe()
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
	$: if (browser) document.dir = $dir
	$: if (browser && data.session && !ws.socket) ws.Connect()
</script>

<Drawer />

<Toast />

<Modal zIndex="z-[9999]" components={modalComponentRegistry} />

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
							<h1 class="h3 hidden items-center lg:flex">NEM</h1>
						</div>
					</a>
				</div>
			</svelte:fragment>

			<!-- Main part -->
			<div class="hidden lg:block">
				<Navigation horizontal />
			</div>
			<h1 class="text-center text-2xl lg:hidden">
				<a href="/">NEM</a>
			</h1>
			<svelte:fragment slot="trail">
				<div class="hidden lg:block">
					<Locale />
				</div>
				{#if !$userStore}
					<a href="/login" role="button" class="variant-filled-primary btn">
						{$t('nav.login')}
					</a>
				{:else}
					<a href="/dashboard/profile">
						<Avatar
							class="cursor-pointer hover:border-primary-500"
							src={$userStore.avatarUrl}
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

<style>
	@import url('https://fonts.googleapis.com/css2?family=Gravitas+One&display=swap');

	h1 {
		font-family: 'Gravitas One', cursive;
	}
</style>
