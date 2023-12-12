<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton'
	import AccountForm from './account-form.svelte'

	const toastStore = getToastStore()

	export let data
	export let form

	$: if (form) {
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

	<AccountForm stripeConnected={data.stripeConnected} />
</div>
