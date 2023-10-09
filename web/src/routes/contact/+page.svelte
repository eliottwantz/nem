<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { t } from 'svelte-i18n'
</script>

<Layout>
	<h1 slot="title" class="h1">{$t('contact.title')}</h1>
</Layout>
