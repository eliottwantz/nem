<script lang="ts">
	import { enhance } from '$app/forms'
	import Layout from '$lib/components/Layout.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	export let data
	export let form

	let timeoutId: number
	let canResendLink = false

	const toastStore = getToastStore()
	$: if (form && !form.success) {
		toastStore.trigger({
			message: form.message,
			background: 'bg-error-500'
		})
	}
	$: if (form && form.success) {
		toastStore.trigger({
			message: form.message,
			background: 'bg-success-500'
		})
	}
	$: if (data.invalidCode) {
		toastStore.trigger({
			message: 'This link is invalid or has expired. Please try again.',
			background: 'bg-error-500',
			autohide: false
		})
	}

	onMount(() => {
		if (data.invalidCode) {
			canResendLink = true
			return
		}
		timeoutId = window.setTimeout(() => {
			canResendLink = true
		}, 10000)
	})
</script>

<Layout>
	<h1 slot="title" class="h1">Email verification</h1>
	<div>
		{#if data.invalidCode}
			<p>The link you used has expired. Click the button below to resend an email</p>
		{:else}
			<p>An email with a verification link has been sent to your inbox</p>
		{/if}
		<form
			method="post"
			use:enhance={() => {
				window.clearTimeout(timeoutId)

				return async ({ update }) => {
					await update()
				}
			}}
		>
			<button disabled={!canResendLink}>Resend verification link</button>
			{#if !canResendLink}
				<span>Didn't receive email? Wait 10 seconds and try again</span>
			{/if}
		</form>
	</div>
</Layout>
