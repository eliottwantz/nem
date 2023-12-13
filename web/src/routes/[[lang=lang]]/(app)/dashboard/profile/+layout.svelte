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
		}
	]
</script>

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
