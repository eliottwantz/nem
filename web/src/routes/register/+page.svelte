<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import OauthLogin from '$lib/components/Oauth/OauthLogin.svelte'
	import type { ServerMessage } from '$lib/schemas/error'
	import { registerSchema } from '$lib/schemas/register.js'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import { superForm } from 'sveltekit-superforms/client'

	export let data
	export let form

	const toastStore = getToastStore()
	$: if ($message && $message.type === 'error') {
		toastStore.trigger({
			message: $message.text,
			background: 'bg-error-500',
			autohide: false
		})
	}

	$: if (form && form.type === 'error') {
		toastStore.trigger({
			message: form.text,
			background: 'bg-error-500',
			autohide: false
		})
	}

	const {
		form: superF,
		errors,
		enhance,
		message
	} = superForm<typeof registerSchema, ServerMessage>(data.form, {
		validators: registerSchema
	})
</script>

<Layout>
	<h1 slot="title" class="h1 max-w-3xl pb-4 text-center">{$t('register.title')}</h1>

	<OauthLogin />

	<span>Or</span>

	<form method="post" action="?/email" use:enhance class="space-y-4">
		<div class="space-y-2">
			<label class="label">
				<span>{$t('register.email')}</span>
				<input class="input" type="email" name="email" bind:value={$superF.email} />
			</label>
			{#if $errors.email}
				<p class="text-error-500">{$errors.email}</p>
			{/if}
			<label class="label">
				<span>{$t('register.password')}</span>
				<input
					class="input"
					type="password"
					name="password"
					bind:value={$superF.password}
				/>
			</label>
			{#if $errors.password}
				<p class="text-error-500">{$errors.password}</p>
			{/if}
		</div>

		{#if $errors._errors}
			{#each $errors._errors as e}
				<p class="text-error-500">{e}</p>
			{/each}
		{/if}

		<button class="btn bg-primary-active-token">
			{$t('register.register')}
		</button>
	</form>

	<a class="anchor" href="/login">{$t('register.loginMsg')}</a>
</Layout>
