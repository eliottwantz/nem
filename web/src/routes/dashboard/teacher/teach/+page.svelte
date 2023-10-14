<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import Layout from '$lib/components/Layout.svelte'
	import SelectTeach from '$lib/components/SelectTeach.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { Trash } from 'lucide-svelte'

	export let data

	const toastStore = getToastStore()

	$: copyTopicsTaught = JSON.parse(JSON.stringify(data.topicsTaught)) as string[]
	let isEditing = false

	async function saveEdits() {
		isEditing = false
		const diff = data.topics.filter((t) => !copyTopicsTaught.includes(t))
		const res = await safeFetch(
			fetchers.teacherService(fetch, $page.data.session).stopTeachingTopics({
				topics: diff
			})
		)
		if (!res.ok) {
			toastStore.trigger({
				message: res.cause,
				background: 'bg-error-500'
			})
			return
		}
		console.log(data.topics)
		console.log(copyTopicsTaught)
		await invalidateAll()
	}
	function cancelEdits() {
		copyTopicsTaught = JSON.parse(JSON.stringify(data.topicsTaught))
		isEditing = false
	}
	function removeTopic(topic: string) {
		copyTopicsTaught = copyTopicsTaught.filter((t) => t !== topic)
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Teach</h1>

	<div class="flex w-full flex-col gap-y-8">
		{#if data.topicsTaught.length > 0}
			<div class="flex gap-4">
				<h2 class="h3">Topics you teach</h2>
				{#if isEditing}
					<button on:click={cancelEdits} class="variant-ghost btn"> Cancel </button>
					<button on:click={saveEdits} class="variant-ghost-success btn"> Save </button>
				{:else}
					<button on:click={() => (isEditing = true)} class="variant-ghost btn"
						>Edit</button
					>
				{/if}
			</div>
			<section
				class="m-auto flex w-full max-w-xl flex-wrap justify-center gap-4 lg:max-w-3xl xl:max-w-5xl"
			>
				{#each copyTopicsTaught as topic}
					<div class="card relative inline-block p-1 sm:p-2">
						{#if isEditing}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<span
								on:click={() => removeTopic(topic)}
								class="variant-filled-error badge-icon absolute -right-0 -top-1 z-10"
							>
								<Trash class="h-4 w-4" />
							</span>
						{/if}
						<p class="h3">{topic}</p>
					</div>
				{/each}
			</section>
		{/if}
		<SelectTeach topics={data.topics} topicsTaught={data.topicsTaught} />
	</div>
</Layout>
