<script lang="ts">
	import { page } from '$app/stores'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	const drawerStore = getDrawerStore()

	export let horizontal: boolean = true

	$: activeUrl = $page.url.pathname
</script>

<nav class="select-none sm:text-lg {horizontal ? '' : 'list-nav'}">
	<ul class={horizontal ? 'flex items-center justify-center space-x-8' : 'space-y-4'}>
		<li>
			<a
				href="/"
				class="flex"
				class:active={activeUrl === '/' && !horizontal}
				on:click={() => drawerStore.close()}
			>
				Home
			</a>
		</li>
		<li>
			<a
				href="/about"
				class="flex"
				class:active={activeUrl === '/about' && !horizontal}
				on:click={() => drawerStore.close()}
			>
				About
			</a>
		</li>
		<li>
			<a
				href="/contact"
				class="flex"
				class:active={activeUrl === '/contact' && !horizontal}
				on:click={() => drawerStore.close()}
			>
				Contact
			</a>
		</li>
	</ul>
</nav>

<style lang="postcss">
	a {
		color: black;
	}

	.active {
		@apply bg-primary-active-token;
	}
</style>
