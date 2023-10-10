<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'

	export let data

	const { user } = data
</script>

<Layout>
	<h1 slot="title" class="h1">Hi {user.firstName} !</h1>
	<form method="post" action="/logout">
		<button class="variant-filled-surface btn">Logout</button>
	</form>
	<a href="/dashboard/profile/edit" class="variant-ghost-surface btn">Edit Profile</a>
	<span>NEM Pass</span>
</Layout>
