<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { t } from 'svelte-i18n'
</script>

<Layout>
	<h1 class="h1" slot="title">{$t('about.title')}</h1>

	<div>content</div>
</Layout>
