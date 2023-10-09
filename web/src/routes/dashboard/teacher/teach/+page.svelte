<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import SelectTeach from '$lib/components/SelectTeach.svelte'
	import Arabic from '$lib/i18n/flags/Arabic.svelte'
	import English from '$lib/i18n/flags/English.svelte'
	import French from '$lib/i18n/flags/French.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import type { ComponentType } from 'svelte'

	export let data
	export let form

	const toastStore = getToastStore()
	$: if (form && form.success)
		toastStore.trigger({ message: form.message, background: 'bg-success-500' })
	$: if (form && !form.success)
		toastStore.trigger({ message: form.message, background: 'bg-error-500' })

	const flagsMap: Record<string, ComponentType> = {
		French: French,
		English: English,
		Arabic: Arabic
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Teach</h1>

	<section class="grid grid-cols-2 gap-4 lg:grid-cols-3">
		{#each data.topicsTaught as teach}
			<div class="card flex justify-center space-x-4 p-4">
				<div class="flex flex-col items-center space-y-2">
					<h3 class="h3">{teach.language}</h3>
					<div class="w-12">
						<svelte:component this={flagsMap[teach.language]} />
					</div>
				</div>
				<div>
					<h3 class="h3">{teach.topic}</h3>
				</div>
			</div>
		{/each}
	</section>

	<SelectTeach languages={data.languages} topics={data.topics} topicsTaught={data.topicsTaught} />
</Layout>
