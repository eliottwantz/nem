<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
	import { signOut } from '@auth/sveltekit/client'

	async function signout() {
		await signOut({ callbackUrl: route('/', langParams()) })
	}
</script>

<Layout>
	<h1 slot="title">Signout</h1>

	<section class="flex flex-col items-center gap-y-4">
		<p class="text-xl">Are you sure you want to sign out?</p>
		<button class="variant-filled-primary btn text-lg" on:click={signout}> Sign out </button>
	</section>
</Layout>
