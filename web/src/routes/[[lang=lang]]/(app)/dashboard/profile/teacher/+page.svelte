<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { superForm } from 'sveltekit-superforms/client'
	import type { cashOutSchema } from './chas-out-form-schema'

	export let data
	const { form, enhance, errors } = superForm<typeof cashOutSchema>(data.form)
</script>

<form action={route('cashOut /dashboard/profile/teacher', langParams())} method="post" use:enhance>
	<p>Available balance: {data.teacher.cashBank}</p>
	<label for="amount">How much do you want to cash out?</label>
	<input type="number" name="amount" bind:value={$form.amount} />
	{#if $errors.amount}
		<p class="text-error-500">{$errors.amount}</p>
	{/if}
	<button type="submit">Cash out</button>
</form>
