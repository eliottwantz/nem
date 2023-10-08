<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { newPasswordSchema } from '$lib/schemas/newPasswordSchema'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { superForm } from 'sveltekit-superforms/client'

	export let data

	const toastStore = getToastStore()
	$: if ($message) {
		toastStore.trigger({
			message: $message,
			background: 'bg-success-500',
			autohide: false
		})
	}

	const {
		form: superF,
		errors,
		enhance,
		message
	} = superForm(data.form, {
		validators: newPasswordSchema
	})
</script>

<Layout>
	<h1 class="h1" slot="title">Reset password</h1>
	<form method="post" use:enhance class="space-y-4 pt-4">
		<label class="label">
			<span>New Password</span>
			<input
				class="input"
				type="password"
				name="password"
				id="password"
				bind:value={$superF.password}
			/><br />
		</label>
		{#if $errors.password}
			<p class="text-error-500">{$errors.password}</p>
		{/if}
		<button class="variant-filled-primary btn">Sumbit</button>
	</form>
</Layout>
