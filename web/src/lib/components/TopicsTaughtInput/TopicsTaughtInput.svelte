<script lang="ts">
	import { TrashIcon } from 'lucide-svelte'

	export let availableTopics: string[]
	export let topicsTaught: string[]
	let topics = (JSON.parse(JSON.stringify(availableTopics)) as string[]).sort((a, b) =>
		a.localeCompare(b)
	)
	$: selectableTopics = topics.filter((l) => !topicsTaught.includes(l))

	function add() {
		if (selectableTopics.length === 0) return
		topicsTaught = topicsTaught.concat(selectableTopics[0])
	}

	function remove(index: number, topic: string) {
		topicsTaught.splice(index, 1)
		topicsTaught = topicsTaught
	}
</script>

<div>
	<p>Topics you want to teach</p>

	{#each topicsTaught as topicTaught, i}
		<div>
			<div class="flex items-center gap-2">
				<select bind:value={topicTaught} class="select">
					{#each topics as topic}
						<option disabled={!selectableTopics.includes(topic)} value={topic}>
							{topic}
						</option>
					{/each}
				</select>
				<button
					on:click={() => remove(i, topicTaught)}
					type="button"
					class="variant-filled-error btn-icon h-8 w-8"
				>
					<TrashIcon />
				</button>
			</div>
		</div>
	{/each}
	{#if selectableTopics.length > 0}
		<button class="mt-4 font-semibold" type="button" on:click={add}> Add a topic </button>
	{/if}
</div>
