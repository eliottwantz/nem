<script lang="ts">
	import CloseIcon from '$lib/icons/CloseIcon.svelte'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import Navigation from '../Navigation.svelte'
	import LangSwitcher from '$components/LangSwitcher.svelte'

	const drawerStore = getDrawerStore()
</script>

<div class="bg-surface-100-800-token flex h-full flex-col space-y-4 p-4 lg:border-r">
	<div class="flex items-center pl-2 pt-1 lg:hidden">
		<CloseIcon on:click={() => drawerStore.close()} />
		<div class="flex-grow"></div>
		<LangSwitcher />
	</div>

	<hr class="border-surface-token divider border-t" />
	<h2 class="pl-9 text-2xl font-semibold lg:hidden">Navigation</h2>
	<div class="flex flex-col pl-10 lg:hidden lg:pl-0">
		<Navigation horizontal={false} />
	</div>
</div>
