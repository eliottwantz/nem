<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'

	export let data

	let { user } = data
</script>

<Layout>
	<h1 slot="title" class="h1">Hi {user.firstName} !</h1>
	<a href={route('/signout', langParams())} class="variant-filled-primary btn">Sign out</a>
	<a href={route('/dashboard/profile/edit', langParams())} class="variant-ghost-surface btn">
		Edit Profile
	</a>
	<span>NEM Pass</span>
	<slot />
</Layout>
