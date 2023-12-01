<script lang="ts">
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import { signOut } from '@auth/sveltekit/client'

	let callbackUrl = `${$page.params.lang ? `/${$page.params.lang}` : ''}/signin/setup-profile`
	async function signout() {
		await signOut({ callbackUrl })
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Signout</h1>

	<section class="flex flex-col gap-y-4">
		<p class="text-xl">Are you sure you want to sign out?</p>
		<button class="variant-filled-primary btn w-full text-lg" on:click={signout}>
			Sign out
		</button>
	</section>
</Layout>
