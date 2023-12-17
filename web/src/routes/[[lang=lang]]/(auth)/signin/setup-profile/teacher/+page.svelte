<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import SpokenLanguageInput from '$lib/components/SpokenLanguageInput/SpokenLanguageInput.svelte'
	import TopicsTaughtInput from '$lib/components/TopicsTaughtInput/TopicsTaughtInput.svelte'
	import type { ServerMessage } from '$lib/schemas/error'
	import { createTeacherSchema } from '$lib/schemas/profile.js'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { superForm } from 'sveltekit-superforms/client'

	export let data

	const toastStore = getToastStore()
	$: if ($message && $message.type === 'error') {
		toastStore.trigger({
			message: $message.text,
			background: 'bg-error-500',
			autohide: false
		})
	}

	const {
		form: superF,
		errors,
		enhance,
		message,
		submitting
	} = superForm<typeof createTeacherSchema, ServerMessage>(data.form, {
		validators: createTeacherSchema,
		dataType: 'json'
	})
</script>

<Layout>
	<h1 slot="title" class="pb-4 text-center">Create your profile</h1>

	<form method="post" use:enhance class="flex w-full max-w-lg flex-col gap-y-4">
		<div class="space-y-2">
			<label class="label">
				<span>First Name</span>
				<input class="input" type="text" name="firstName" bind:value={$superF.firstName} />
			</label>
			{#if $errors.firstName}
				<p class="text-error-500">{$errors.firstName}</p>
			{/if}
			<label class="label">
				<span>Last Name</span>
				<input class="input" type="text" name="lastName" bind:value={$superF.lastName} />
			</label>
			{#if $errors.lastName}
				<p class="text-error-500">{$errors.lastName}</p>
			{/if}

			<label class="label">
				<span>Birthday</span>
				<input class="input" type="date" name="birthday" bind:value={$superF.birthday} />
			</label>
			{#if $errors.birthday}
				<p class="text-error-500">{$errors.birthday}</p>
			{/if}

			<label class="label">
				<span>Biography</span>
				<textarea class="input" rows="4" name="bio" bind:value={$superF.bio} />
			</label>
			{#if $errors.bio}
				<p class="text-error-500">{$errors.bio}</p>
			{/if}

			<label class="label">
				<span>Hour Rate</span>
				<input class="input" type="number" name="hourRate" bind:value={$superF.hourRate} />
			</label>
			{#if $errors.hourRate}
				<p class="text-error-500">{$errors.hourRate}</p>
			{/if}

			<SpokenLanguageInput
				allLanguages={data.languages}
				bind:spokenLanguages={$superF.spokenLanguages}
			/>
			<!-- {#if $errors.spokenLanguages && $errors.spokenLanguages._errors && $tainted?.spokenLanguages} -->
			{#if $errors.spokenLanguages && $errors.spokenLanguages._errors}
				<p class="text-error-500">{$errors.spokenLanguages._errors}</p>
			{/if}

			<hr class="divider border-surface-500" />

			<TopicsTaughtInput
				bind:topicsTaught={$superF.topicsTaught}
				availableTopics={data.topics}
			/>
			<!-- {#if $errors.topicsTaught && $errors.topicsTaught._errors && $tainted?.topicsTaught} -->
			{#if $errors.topicsTaught && $errors.topicsTaught._errors}
				<p class="text-error-500">{$errors.topicsTaught._errors}</p>
			{/if}
		</div>

		<button disabled={$submitting} class="btn bg-primary-active-token"> Create profile </button>
	</form>
</Layout>
