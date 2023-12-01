<script lang="ts">
	import { page } from '$app/stores'

	export let href: string

	let lang = $page.params.lang ?? ''
	let actualLink = href.startsWith('/') ? `/${lang}${href}` : `/${lang}/${href}`
	if (href === '/') actualLink = `/${lang}`
	else if (!lang) actualLink = href.startsWith('/') ? href : `/${href}`
</script>

<a {...$$restProps} on:click href={actualLink}>
	<slot />
</a>
