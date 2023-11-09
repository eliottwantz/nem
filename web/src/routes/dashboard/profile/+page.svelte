<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'

	export let data

	const { user } = data
</script>

<Layout>
	<h1 slot="title" class="h1">Hi {user.name} !</h1>
	<a class="variant-filled-primary btn" href="/signout">Sign out</a>
	<a href="/dashboard/profile/edit" class="variant-ghost-surface btn">Edit Profile</a>
	<span>NEM Pass</span>
</Layout>
