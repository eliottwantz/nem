<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { route } from '$lib/ROUTES'
	import { superForm } from 'sveltekit-superforms/client'
	import type { cashOutSchema } from './cashOutFormSchema'
	import { langParams } from '$i18n'
	import PoweredByStripe from '$lib/icons/PoweredByStripe.svelte'
	import { LucideShieldCheck, LucideShieldX } from 'lucide-svelte'
	import { enhance } from '$app/forms'

	const toastStore = getToastStore()

	export let data
	export let form

	$: if (form && form.text) {
		toastStore.trigger({
			message: form.text,
			background: 'bg-error-500'
		})
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-xl font-medium">Account</h3>
		<p class="text-muted-foreground text-sm">This are settings related to your account.</p>
	</div>
	<hr class="separator my-6" />

	<div>
		<div class="mb-4 space-y-4">
			<label class="label">
				<span>Email</span>
				<input
					class="input"
					type="text"
					name="email"
					title="Email (readonly)"
					placeholder={data.session?.user.email}
					readonly
					tabindex="-1"
				/>
			</label>
		</div>

		<hr class="separator my-6" />

		{#if data.teacher}
			<div
				class="space-y-4 rounded-lg px-4 py-2 outline outline-2 {data.stripeSetupDone
					? 'outline-success-500'
					: 'outline-error-500'} "
			>
				<div class="flex items-center gap-x-2">
					<p>Payment method</p>
					<PoweredByStripe />
				</div>
				<ul class="ml-8 list-disc">
					<li>Connect directly to your bank account</li>
					<li>Payouts within 5 business days</li>
				</ul>
				<div class="flex flex-col gap-2 sm:flex-row">
					{#if data.stripeSetupDone}
						<div class="flex items-center gap-x-1">
							<LucideShieldCheck
								size="32"
								class="fill-success-200 text-success-600"
							/>
							<p>Account connected</p>
						</div>
						<div class="flex gap-x-2">
							<form
								action={route(
									'dashboardPayouts /dashboard/profile/account',
									langParams()
								)}
								method="post"
								use:enhance
							>
								<button class="variant-filled-primary btn btn-sm" type="submit">
									Open payout dashboard
								</button>
							</form>
							<!-- <button class="variant-glass-surface btn btn-sm">Modify</button> -->
						</div>
					{:else}
						<LucideShieldX size="32" class="fill-error-200 text-error-600" />
						{#if data.teacher.stripeAccount}
							<form
								action={route(
									'finishSetup /dashboard/profile/account',
									langParams()
								)}
								method="post"
								use:enhance
							>
								<button class="variant-filled-primary btn"
									>Finish connection setup</button
								>
							</form>
						{:else}
							<form
								action={route(
									'createAccount /dashboard/profile/account',
									langParams()
								)}
								method="post"
								use:enhance
							>
								<button class="variant-filled-primary btn"
									>Connect Bank Account</button
								>
							</form>
						{/if}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
