<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import Layout from '$lib/components/Layout.svelte'
	import type { ServerMessage } from '$lib/schemas/error'
	import { createStudentSchema } from '$lib/schemas/profile.js'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { languageTag } from 'i18n/runtime'
	import { superForm } from 'sveltekit-superforms/client'

	export let data

	const toastStore = getToastStore()

	async function sumbitForm() {
		const parseRes = createStudentSchema.safeParse($superF)
		if (!parseRes.success) {
			console.log('errors', parseRes.error.issues)
			for (const i of parseRes.error.issues) {
				toastStore.trigger({
					message: i.message,
					background: 'bg-error-500'
				})
				//@ts-expect-error
				$errors[String(i.path[0])] = i.message
			}
			return
		}
		try {
			const res = await fetch('/signin/setup-profile/student', {
				method: 'POST',
				body: JSON.stringify($superF)
			})
			if (res.status !== 201) {
				const data = await res.json()
				const errMsg = data as ServerMessage
				toastStore.trigger({
					message: errMsg.text,
					background: 'bg-error-500'
				})
				return
			}
			await goto('/dashboard/profile')
			invalidateAll()
		} catch (e) {
			toastStore.trigger({
				message: e instanceof Error ? e.message : 'Unknown error',
				background: 'bg-error-500'
			})
		}
	}

	const { form: superF, errors } = superForm(data.form, {
		validators: createStudentSchema
	})

	$: $superF.preferedLanguage = languageTag()
	$: console.log('form', $superF)
	$: console.log($errors)
</script>

<Layout>
	<h1 slot="title" class="h1 pb-4 text-center">Create your profile</h1>

	<form method="post" on:submit|preventDefault={sumbitForm} class="space-y-4">
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
		</div>

		<button class="btn bg-primary-active-token"> Create profile </button>
	</form>
</Layout>
