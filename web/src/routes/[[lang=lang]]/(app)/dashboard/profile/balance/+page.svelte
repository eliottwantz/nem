<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { superForm } from 'sveltekit-superforms/client'
	import type { cashOutSchema } from './chas-out-form-schema'

	export let data
	const { form, enhance, errors } = superForm<typeof cashOutSchema>(data.form)
</script>

<form action={route('cashOut /dashboard/profile/balance', langParams())} method="post" use:enhance>
	<p>Available balance: {data.teacher.cashBank}</p>
	<label class="label" for="amount">How much do you want to cash out?</label>
	<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
		<div>$ USD</div>
		<input type="number" name="amount" bind:value={$form.amount} />
		<button
			type="button"
			on:click={() => ($form.amount = data.teacher.cashBank)}
			class="variant-ghost btn">Max</button
		>
	</div>
	{#if $errors.amount}
		<p class="text-error-500">{$errors.amount}</p>
	{/if}
	<button class="variant-filled-primary btn" type="submit">Cash out</button>
</form>
