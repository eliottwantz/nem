<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { createClassSchema } from '$lib/schemas/createClass'
	import type { FormErrorMessage } from '$lib/schemas/error'
	import { InputChip, getToastStore } from '@skeletonlabs/skeleton'
	import { superForm } from 'sveltekit-superforms/client'

	export let data
	console.log('LEARNS', data.learns)
	const toastStore = getToastStore()

	const { form, errors, enhance, message, capture, restore } = superForm<
		typeof createClassSchema,
		FormErrorMessage
	>(data.form, {
		validators: createClassSchema
	})
	export const snapshot = { capture, restore }
	$: console.log($form)

	$: if ($message) {
		toastStore.trigger({
			message: $message.text,
			background: $message.type === 'success' ? 'bg-success-500' : 'bg-error-500'
		})
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Create Class</h1>

	{#if $message && $message.type === 'error'}
		<p class="text-lg text-error-500">{$message.text}</p>
	{/if}

	<form method="post" class="flex max-w-2xl flex-col items-center space-y-4" use:enhance>
		<div class="space-y-2">
			<label class="label">
				<span>Class Name</span>
				<input class="input" type="text" name="name" bind:value={$form.name} />
			</label>
			{#if $errors.name}
				<p class="text-error-500">{$errors.name}</p>
			{/if}
			<label class="label">
				<span>Language - Topic</span>
				<select class="select" name="learnId" bind:value={$form.learnId}>
					<option value="" disabled selected hidden>Please select an option</option>
					{#each data.learns as learn}
						<option value={`${learn.id}`}>
							{learn.language} - {learn.topic}
						</option>
					{/each}
				</select>
			</label>
			{#if $errors.learnId}
				<p class="text-error-500">{$errors.learnId}</p>
			{/if}
			<p>User IDs</p>
			<InputChip
				name="userIDs"
				placeholder="Press enter after each ID"
				allowUpperCase={true}
				bind:value={$form.userIDs}
			/>
			{#if $errors.userIDs?._errors && $errors.userIDs?._errors.length > 0}
				<p class="text-error-500">{$errors.userIDs?._errors}</p>
			{/if}
			<label>
				<span>Start at</span>
				<input
					class="input"
					type="datetime-local"
					name="startAt"
					bind:value={$form.startAt}
				/>
			</label>
			{#if $errors.startAt}
				<p class="text-error-500">{$errors.startAt}</p>
			{/if}
		</div>

		<button class="btn bg-primary-active-token"> Add class </button>
	</form>
</Layout>
