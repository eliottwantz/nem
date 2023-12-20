<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { createStudentSchema } from '$lib/schemas/profile.js'
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
		message
	} = superForm(data.form, {
		validators: createStudentSchema
	})
</script>

<Layout>
	<h1 slot="title" class="pb-4 text-center">Create your profile</h1>

	<form method="post" use:enhance class="space-y-4">
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
		</div>

		<button type="submit" class="btn bg-primary-active-token"> Create profile </button>
	</form>
</Layout>
