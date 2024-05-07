<script lang="ts">
	import { page } from '$app/stores'
	import LangSwitcher from '$components/LangSwitcher.svelte'
	import ProfileDropdown from '$components/ProfileDropdown.svelte'
	import { langParams, m } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import Navigation from '$lib/components/Navigation.svelte'
	import StudentSidebar from '$lib/components/Sidebar/StudentSidebar.svelte'
	import TeacherSidebar from '$lib/components/Sidebar/TeacherSidebar.svelte'
	import Logo from '$lib/icons/Logo.svelte'
	import { AppBar, AppShell, getDrawerStore } from '@skeletonlabs/skeleton'
	import { Hourglass } from 'lucide-svelte'

	export let data
	const drawerStore = getDrawerStore()
</script>

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
					<a href={route('/', langParams())}>
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
			<a href={route('/', langParams())}>
				<h1 id="nem" class="text-center text-2xl lg:hidden">NEM</h1>
			</a>
			<svelte:fragment slot="trail">
				{#if $page.url.pathname.startsWith('/teachers/') && $page.url.pathname.at(-1) !== 's' && $page.data.user.id !== $page.params.id}
					<div id="hoursBank" class="flex flex-wrap items-center justify-center">
						<span class="text-xl">{$page.data.hoursBank}h</span>
						<Hourglass />
					</div>
				{/if}
				{#if $page.url.pathname.startsWith('/dashboard/student/classes/') && $page.url.pathname.at(-1) !== 's'}
					<div id="hoursBank" class="flex flex-wrap items-center justify-center">
						<span class="text-xl">{$page.data.hoursBank}h</span>
						<Hourglass />
					</div>
				{/if}
				<div class="hidden lg:block">
					<LangSwitcher />
				</div>
				{#if !data.session}
					<a
						href={route('/signin', langParams())}
						role="button"
						class="variant-filled-primary btn"
					>
						Signin
					</a>
				{:else if !data.user}
					<a
						href={route('/signout', langParams())}
						role="button"
						class="variant-filled-primary btn"
					>
						{m.signout()}
					</a>
				{:else}
					<ProfileDropdown email={data.session.user.email} user={data.user} />
					<!-- <a href={route('/dashboard/profile', langParams())}>
						<Avatar
							class="cursor-pointer hover:border-primary-500"
							src={data.user.avatarUrl ?? ''}
							initials={getInitials(data.user)}
						/>
					</a> -->
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

<style type="postcss">
	#nem {
		font-family: 'Gravitas One', cursive;
	}
</style>
