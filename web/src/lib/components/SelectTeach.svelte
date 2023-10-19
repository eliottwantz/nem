<script lang="ts">
	import { page } from '$app/stores'
	import type { ServerMessage } from '$lib/schemas/error'
	import { teachNewTopicSchema } from '$lib/schemas/teach'
	import { ListBox, ListBoxItem, getToastStore } from '@skeletonlabs/skeleton'
	import { superForm } from 'sveltekit-superforms/client'

	export let topics: string[]
	export let topicsTaught: string[]

	const toastStore = getToastStore()
	$: if ($message && $message.type === 'success') {
		toastStore.trigger({
			message: $message.text,
			background: 'bg-success-500'
		})
	}
	$: if ($message && $message.type === 'error') {
		toastStore.trigger({
			message: $message.text,
			background: 'bg-error-500',
			autohide: false
		})
	}

	const { form, errors, enhance, message } = superForm<typeof teachNewTopicSchema, ServerMessage>(
		$page.data.form,
		{
			validators: teachNewTopicSchema
		}
	)

	$: availableTopics = topics.filter((t) => !topicsTaught.includes(t))
	$: console.log('availableTopics', availableTopics)
	$: console.log('form', $form)
</script>

<div class="card text-token w-full p-4">
	<form use:enhance method="post" class="flex flex-col gap-4">
		<p class=" text-xl font-semibold">Topic to teach</p>
		{#if $errors.topic}
			<p class="text-red-500">{$errors.topic}</p>
		{/if}
		<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
			{#each availableTopics as topic}
				<ListBoxItem bind:group={$form.topic} name={topic} value={topic}>
					{topic}
				</ListBoxItem>
			{/each}
		</ListBox>
		<input type="text" name="topic" class="hidden" value={$form.topic} />
		<button disabled={!$form.topic} class="variant-filled-primary btn self-center">
			Teach
		</button>
	</form>
</div>
