<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { href } from '$lib/utils/redirect'

	export let data

	let { user } = data
</script>

<Layout>
	<h1 slot="title" class="h1">Hi {user.firstName} !</h1>
	<a class="variant-filled-primary btn" href={href('/signout')}>Sign out</a>
	<a href={href("/dashboard/profile/edit")} class="variant-ghost-surface btn">Edit Profile</a>
	<span>NEM Pass</span>
</Layout>
