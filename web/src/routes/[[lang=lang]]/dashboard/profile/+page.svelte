<script lang="ts">
	import Link from '$components/Link.svelte'
	import Layout from '$lib/components/Layout.svelte'

	export let data

	let { user } = data
</script>

<Layout>
	<h1 slot="title" class="h1">Hi {user.firstName} !</h1>
	<Link class="variant-filled-primary btn" href="/signout">Sign out</Link>
	<Link href="/dashboard/profile/edit" class="variant-ghost-surface btn">Edit Profile</Link>
	<span>NEM Pass</span>
</Layout>
