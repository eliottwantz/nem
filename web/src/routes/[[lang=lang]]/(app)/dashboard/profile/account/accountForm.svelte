<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import PoweredByStripe from '$lib/icons/PoweredByStripe.svelte'
	import type { StripeAccount } from '@prisma/client'
	import { LucideShieldCheck, LucideShieldX } from 'lucide-svelte'

	export let stripeAccount: StripeAccount | null = null
	export let stripeSetupDone: boolean = false

	$: email = $page.data.session?.user.email
</script>

<div>
	<div class="mb-4 space-y-4">
		<label class="label">
			<span>Email</span>
			<input
				class="input"
				type="text"
				name="firstName"
				title="Email (readonly)"
				placeholder={email}
				readonly
				tabindex="-1"
			/>
		</label>
	</div>

	<hr class="separator my-6" />

	<div
		class="space-y-4 rounded-lg px-4 py-2 outline outline-2 {stripeSetupDone
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
		<div class="1 flex items-center gap-x-1">
			{#if stripeSetupDone}
				<LucideShieldCheck size="32" class="fill-success-200 text-success-600" />
				<p>Account connected</p>
				<button class="variant-glass-surface btn ml-4">Modify</button>
			{:else}
				<LucideShieldX size="32" class="fill-error-200 text-error-600" />
				{#if stripeAccount}
					<form
						action={route('finishSetup /dashboard/profile/account', langParams())}
						method="post"
						use:enhance
					>
						<button class="variant-filled-primary btn">Finish connection setup</button>
					</form>
				{:else}
					<form
						action={route('createAccount /dashboard/profile/account', langParams())}
						method="post"
						use:enhance
					>
						<button class="variant-filled-primary btn">Connect Bank Account</button>
					</form>
				{/if}
			{/if}
		</div>
		<slot />
	</div>
</div>
