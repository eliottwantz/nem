<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'

	import { takeClassStore } from '$lib/stores/takeClassStore'
	import { page } from '$app/stores'
	import { getToastStore } from '@skeletonlabs/skeleton'
	console.log('page', $page)

	const toastStore = getToastStore()
</script>

<Layout>
	<h1 class="h1" slot="title">Take class</h1>

	<h2>AHEEEE</h2>
	<button
		on:click={async () => {
			fetch($page.url.pathname, {
				method: 'POST'
			})
				.then((res) => res.json())
				.then((data) => {
					window.location.replace(data.url)
				})
				.catch((e) => {
					console.log(e)
					toastStore.trigger({
						message: e,
						background: 'bg-error-500'
					})
				})
		}}
		class="variant-filled-primary btn">Take class</button
	>
</Layout>
