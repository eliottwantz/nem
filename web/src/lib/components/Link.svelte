<script lang="ts">
	import { page } from '$app/stores'

	export let href: string

	const actualLink = href === '/' ? '' : href.startsWith('/') ? href : `/${href}`
</script>

<a {...$$restProps} href="/{$page.params.lang}{actualLink}">
	<slot />
</a>
