<script lang="ts">
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
</script>

<Layout>
	<h1 class="h1" slot="title">About</h1>

	<div>About content</div>

	<a href={route('/contact')}>Go to contact</a>
</Layout>
