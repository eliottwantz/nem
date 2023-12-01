<script lang="ts">
	import Link from '$components/Link.svelte'
	import Layout from '$lib/components/Layout.svelte'
</script>

<Layout>
	<h1 class="h1" slot="title">About</h1>

	<div>About content</div>

	<Link href="/contact">Go to contact</Link>
</Layout>
