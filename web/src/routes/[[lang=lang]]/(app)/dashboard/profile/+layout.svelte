<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
	import ProfileSidebar from './profile-sidebar.svelte'

	export let data
	let { user } = data

	const sidebarNavItems = [
		{
			title: 'Profile',
			href: route('/dashboard/profile', langParams())
		},
		{
			title: 'Account',
			href: route('/dashboard/profile/account', langParams())
		},
		{
			title: 'Balance',
			href: route('/dashboard/profile/balance', langParams())
		}
	]
</script>

<!-- <Layout> -->
<!-- <h1 slot="title" class="h1">Hi {user.firstName} !</h1>
	<a href={route('/signout', langParams())} class="variant-filled-primary btn">Sign out</a>
	<a href={route('/dashboard/profile/edit', langParams())} class="variant-ghost-surface btn">
		Edit Profile
	</a>
	<span>NEM Pass</span>
	<slot /> -->
<!-- </Layout> -->
<div class="space-y-6 p-10 pb-16">
	<div class="space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Settings</h2>
		<p class="text-muted-foreground">
			Manage your account settings and set e-mail preferences.
		</p>
	</div>
	<hr class="separator my-6" />
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
		<aside class="-mx-4 lg:w-1/5">
			<ProfileSidebar items={sidebarNavItems} />
		</aside>
		<div class="flex-1 lg:max-w-2xl">
			<slot />
		</div>
	</div>
</div>
