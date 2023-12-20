<script lang="ts">
	import Layout from '$components/Layout.svelte'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import ProfileSidebar from './profile-sidebar.svelte'

	export let data

	const sidebarNavItems = [
		{
			title: 'Profile',
			href: route('/dashboard/profile', langParams())
		},
		{
			title: 'Account',
			href: route('/dashboard/profile/account', langParams())
		}
	]
	const teacherNavItems = sidebarNavItems.concat({
		title: 'Students',
		href: route('/dashboard/profile/students', langParams())
	})
	const studentNavItems = sidebarNavItems.concat({
		title: 'Subscriptions',
		href: route('/dashboard/profile/subscriptions', langParams())
	})
</script>

<Layout>
	<h1 slot="title">Settings</h1>
	<p slot="subtitle">Manage your profile and related settings</p>
	<div class="flex flex-col gap-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
		<aside class="lg:w-1/5">
			{#if data.user.role === 'teacher'}
				<ProfileSidebar items={teacherNavItems} />
			{:else}
				<ProfileSidebar items={studentNavItems} />
			{/if}
		</aside>
		<div class="flex-1">
			<slot />
		</div>
	</div>
</Layout>
<!-- <div class="space-y-6 p-2 md:p-10 md:pb-16">
	<div class="space-y-0.5">
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">Manage your profile and related settings</p>
	</div>
	<hr class="divider my-6" />
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
		<aside class="-mx-4 lg:w-1/5">
			{#if data.user.role === 'teacher'}
				<ProfileSidebar items={teacherNavItems} />
			{:else}
				<ProfileSidebar items={studentNavItems} />
			{/if}
		</aside>
		<div class="flex-1 lg:max-w-2xl">
			<slot />
		</div>
	</div>
</div> -->
