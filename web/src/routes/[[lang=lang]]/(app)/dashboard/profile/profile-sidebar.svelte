<script lang="ts">
	import { page } from '$app/stores'
	export let items: { href: string; title: string }[]
</script>

<nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
	{#each items as item}
		<a
			href={item.href}
			class="btn justify-start {$page.url.pathname === item.href
				? 'variant-filled-surface'
				: 'hover:underline'}"
		>
			{item.title}
		</a>
	{/each}
</nav>
