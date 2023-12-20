<script lang="ts">
	import { page } from '$app/stores'
	import { langParams, m } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	const drawerStore = getDrawerStore()

	export let horizontal: boolean = true

	$: activeUrl = $page.url.pathname
</script>

<nav class="select-none sm:text-lg {horizontal ? '' : 'list-nav'}">
	<ul class={horizontal ? 'flex items-center justify-center space-x-8' : 'space-y-4'}>
		<li>
			<a
				href={route('/', langParams())}
				class="flex text-black {activeUrl === `/${$page.params.lang ?? ''}` && !horizontal
					? 'bg-primary-active-token'
					: ''}"
				on:click={() => drawerStore.close()}
			>
				{m.home()}
			</a>
		</li>
		<li>
			<a
				href={route('/about', langParams())}
				class="flex text-black {activeUrl ===
					`/${$page.params.lang ?? ''}${$page.params.lang ? '/' : ''}about` && !horizontal
					? 'bg-primary-active-token'
					: ''}"
				on:click={() => drawerStore.close()}
			>
				{m.about()}
			</a>
		</li>
		<li>
			<a
				href={route('/contact', langParams())}
				class="flex text-black {activeUrl ===
					`/${$page.params.lang ?? ''}${$page.params.lang ? '/' : ''}contact` &&
				!horizontal
					? 'bg-primary-active-token'
					: ''}"
				on:click={() => drawerStore.close()}
			>
				{m.contact()}
			</a>
		</li>
	</ul>
</nav>
