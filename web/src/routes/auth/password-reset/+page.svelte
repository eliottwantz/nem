<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import type { FormErrorMessage } from '$lib/schemas/error'
	import { forgotPasswordSchema } from '$lib/schemas/forgotPassword'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import { superForm } from 'sveltekit-superforms/client'

	export let data

	const toastStore = getToastStore()
	$: if ($message) {
		toastStore.trigger({
			message: $message.text,
			background: $message.type === 'error' ? 'bg-error-500' : 'bg-success-500',
			autohide: $message.type === 'error' ? false : true
		})
	}

	const {
		form: superF,
		errors,
		enhance,
		message
	} = superForm<typeof forgotPasswordSchema, FormErrorMessage>(data.form, {
		validators: forgotPasswordSchema
	})
</script>

<Layout>
	<h1 class="h1" slot="title">Reset Your Password</h1>

	<form class="space-y-4" method="post" use:enhance>
		<p>Please enter your email address. We will send you a link to reset your password.</p>
		<div class="space-y-2">
			<label class="label">
				<span>{$t('login.email')}</span>
				<input class="input" name="email" type="text" bind:value={$superF.email} />
			</label>
			{#if $errors.email}
				<span class="text-error-500">{$errors.email}</span>
			{/if}
		</div>

		<button class="btn bg-primary-active-token">Send email</button>
	</form>
</Layout>
