<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import Layout from '$lib/components/Layout.svelte'
	import type { FormErrorMessage } from '$lib/schemas/error'
	import { createStudentSchema } from '$lib/schemas/profile.js'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { locale, t } from 'svelte-i18n'
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
			const res = await fetch('/register/setup-profile/student', {
				method: 'POST',
				body: JSON.stringify($superF)
			})
			if (res.status !== 201) {
				const data = await res.json()
				const errMsg = data as FormErrorMessage
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

	$: $superF.preferedLanguage = $locale ?? 'en'
	$: console.log('form', $superF)
	$: console.log($errors)
</script>

<Layout>
	<h1 slot="title" class="h1 pb-4 text-center">{$t('setup-profile.title')}</h1>

	<form method="post" on:submit|preventDefault={sumbitForm} class="space-y-4">
		<div class="space-y-2">
			<label class="label">
				<span>{$t('register.firstName')}</span>
				<input class="input" type="text" name="firstName" bind:value={$superF.firstName} />
			</label>
			{#if $errors.firstName}
				<p class="text-error-500">{$errors.firstName}</p>
			{/if}
			<label class="label">
				<span>{$t('register.lastName')}</span>
				<input class="input" type="text" name="lastName" bind:value={$superF.lastName} />
			</label>
			{#if $errors.lastName}
				<p class="text-error-500">{$errors.lastName}</p>
			{/if}
			<input type="text" name="role" value={$superF.role} hidden />
		</div>

		<button class="btn bg-primary-active-token">
			{$t('register.register')}
		</button>
	</form>
</Layout>
