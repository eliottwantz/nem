<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import type { ServerMessage } from '$lib/schemas/error'
	import { forgotPasswordSchema } from '$lib/schemas/forgotPassword'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import { superForm } from 'sveltekit-superforms/client'

	export let data

	const toastStore = getToastStore()
	$: if (data.invalidCode) {
		toastStore.trigger({
			message: 'This link is invalid or has expired. Please try again.',
			background: 'bg-error-500',
			autohide: false
		})
	}

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
	} = superForm<typeof forgotPasswordSchema, ServerMessage>(data.form, {
		validators: forgotPasswordSchema
	})
</script>

<Layout>
	<h1 class="h1" slot="title">Reset Your Password</h1>

	<form class="flex flex-col items-center space-y-4" method="post" use:enhance>
		<p>
			Please enter your email address. We will send you a link to reset your password if it
			exists.
		</p>
		<div class="w-full max-w-md space-y-2">
			<label class="label">
				<span>{$t('login.email')}</span>
				<!-- svelte-ignore a11y-autofocus -->
				<input
					autofocus
					class="input"
					name="email"
					type="text"
					bind:value={$superF.email}
				/>
			</label>
			{#if $errors.email}
				<span class="text-error-500">{$errors.email}</span>
			{/if}
		</div>

		<button class="btn bg-primary-active-token">Send email</button>
	</form>
</Layout>
