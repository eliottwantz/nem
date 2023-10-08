<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import OauthLogin from '$lib/components/Oauth/OauthLogin.svelte'
	import type { FormErrorMessage } from '$lib/schemas/error'
	import { loginSchema } from '$lib/schemas/login'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import { superForm } from 'sveltekit-superforms/client'

	export let data

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

	const {
		form: superF,
		errors,
		enhance,
		message
	} = superForm<typeof loginSchema, FormErrorMessage>(data.form, {
		validators: loginSchema
	})
</script>

<Layout>
	<h1 slot="title" class="h1">{$t('login.login')}</h1>

	<OauthLogin />

	<span>Or</span>

	<form class="space-y-4" method="post" action="?/login" use:enhance>
		<div class="space-y-2">
			<label class="label">
				<span>{$t('login.email')}</span>
				<input class="input" name="email" type="text" bind:value={$superF.email} />
			</label>
			{#if $errors.email}
				<p class="text-error-500">{$errors.email}</p>
			{/if}
			<label class="label">
				<span>{$t('login.password')}</span>
				<input
					class="input"
					name="password"
					type="password"
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

		<button class="btn bg-primary-active-token">{$t('login.login')}</button>
	</form>

	<div class="flex flex-col items-center">
		<a class="anchor" href="/auth/password-reset">Forgot password?</a>
		<a class="anchor" href="/register">{$t('login.registerMsg')}</a>
	</div>
</Layout>
