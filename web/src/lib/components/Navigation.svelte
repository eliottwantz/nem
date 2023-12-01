<script lang="ts">
	import { page } from '$app/stores'
	import { m } from '$i18n'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import Link from './Link.svelte'
	const drawerStore = getDrawerStore()

	export let horizontal: boolean = true

	$: activeUrl = $page.url.pathname
</script>

<nav class="select-none sm:text-lg {horizontal ? '' : 'list-nav'}">
	<ul class={horizontal ? 'flex items-center justify-center space-x-8' : 'space-y-4'}>
		<li>
			<Link
				href="/"
				class="flex text-black {activeUrl === `/${$page.params.lang ?? ''}` && !horizontal
					? 'bg-primary-active-token'
					: ''}"
				on:click={() => drawerStore.close()}
			>
				{m.home()}
			</Link>
		</li>
		<li>
			<Link
				href="/about"
				class="flex text-black {activeUrl ===
					`/${$page.params.lang ?? ''}${$page.params.lang ? '/' : ''}about` && !horizontal
					? 'bg-primary-active-token'
					: ''}"
				on:click={() => drawerStore.close()}
			>
				{m.about()}
			</Link>
		</li>
		<li>
			<Link
				href="/contact"
				class="flex text-black {activeUrl ===
					`/${$page.params.lang ?? ''}${$page.params.lang ? '/' : ''}contact` &&
				!horizontal
					? 'bg-primary-active-token'
					: ''}"
				on:click={() => drawerStore.close()}
			>
				{m.contact()}
			</Link>
		</li>
	</ul>
</nav>
