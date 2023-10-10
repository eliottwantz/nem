<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import SpokenLanguageInput from '$lib/components/SpokenLanguageInput/SpokenLanguageInput.svelte'
	import type { ServerMessage } from '$lib/schemas/error'
	import { createTeacherSchema } from '$lib/schemas/profile.js'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { locale, t } from 'svelte-i18n'
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
	} = superForm<typeof createTeacherSchema, ServerMessage>(data.form, {
		validators: createTeacherSchema,
		dataType: 'json'
	})

	$: $superF.preferedLanguage = $locale ?? 'en'
</script>

<Layout>
	<h1 slot="title" class="h1 pb-4 text-center">{$t('setup-profile.title')}</h1>

	<form method="post" action="?/registerTeacher" use:enhance class="w-full max-w-lg space-y-4">
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

			<label class="label">
				<span>{$t('register.bio')}</span>
				<textarea class="input" rows="4" name="bio" bind:value={$superF.bio} />
			</label>
			{#if $errors.bio}
				<p class="text-error-500">{$errors.bio}</p>
			{/if}

			<label class="label">
				<span>{$t('register.hourRate')}</span>
				<input class="input" type="number" name="hourRate" bind:value={$superF.hourRate} />
			</label>
			{#if $errors.hourRate}
				<p class="text-error-500">{$errors.hourRate}</p>
			{/if}

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<SpokenLanguageInput bind:spokenLanguages={$superF.spokenLanguages} />
			{#if $errors.spokenLanguages}
				<p class="text-error-500">{$errors.spokenLanguages._errors}</p>
			{/if}
		</div>

		<button class="btn bg-primary-active-token">
			{$t('register.register')}
		</button>
	</form>
</Layout>
