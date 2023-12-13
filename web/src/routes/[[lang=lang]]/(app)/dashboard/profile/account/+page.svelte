<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton'
	import AccountForm from './accountForm.svelte'
	import { route } from '$lib/ROUTES'
	import { superForm } from 'sveltekit-superforms/client'
	import type { cashOutSchema } from './cashOutFormSchema'
	import { langParams } from '$i18n'

	const toastStore = getToastStore()

	export let data
	export let form

	const { form: superF, enhance, errors } = superForm<typeof cashOutSchema>(data.form)

	$: if (form && form.text) {
		toastStore.trigger({
			message: form.text,
			background: 'bg-error-500'
		})
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Account</h3>
		<p class="text-muted-foreground text-sm">This are settings related to your account.</p>
	</div>
	<hr class="separator my-6" />

	<AccountForm stripeAccount={data.teacher.stripeAccount} stripeSetupDone={data.stripeSetupDone}>
		{#if data.stripeSetupDone}
			<form
				action={route('cashOut /dashboard/profile/account', langParams())}
				method="post"
				use:enhance
			>
				<p>Available balance: {data.teacher.cashBank} $</p>
				<div class="input-group input-group-divider grid-cols-[auto_1fr_auto_auto]">
					<div>$ USD</div>
					<input
						type="number"
						min="10"
						max={data.teacher.cashBank}
						name="amount"
						bind:value={$superF.amount}
					/>
					<button
						type="button"
						on:click={() => ($superF.amount = data.teacher.cashBank)}
						class="variant-ghost">Max</button
					>
					<button class="variant-filled-primary" type="submit">Cash out</button>
				</div>
				{#if $errors.amount}
					<p class="text-error-500">{$errors.amount}</p>
				{/if}
			</form>
		{/if}
	</AccountForm>
</div>
