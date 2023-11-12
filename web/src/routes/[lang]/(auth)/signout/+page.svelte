<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { href } from '$lib/utils/redirect'
	import { signOut } from '@auth/sveltekit/client'

	export let data

	async function signout() {
		await signOut({ callbackUrl: href('/') })
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Signout</h1>

	<section class="flex flex-col gap-y-4">
		<form class="space-y-2" method="post" action="/auth/signout?callbackUrl=/">
			<input type="text" name="csrfToken" value={data.csrfToken} class="hidden" />
			<p class="text-xl">Are you sure you want to sign out?</p>
			<button class="variant-filled-primary btn w-full text-lg" on:click={signout}>
				Sign out
			</button>
		</form>
	</section>
</Layout>
