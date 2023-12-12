<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { LucideShieldCheck, LucideShieldX } from 'lucide-svelte'

	export let stripeConnected: boolean = false

	$: email = $page.data.session?.user.email

	// const connectWise = async () => {
	// 	const myHeaders = new Headers()
	// 	myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

	// 	const urlencoded = new URLSearchParams()
	// 	urlencoded.append('grant_type', 'client_credentials')

	// 	fetch('https://api.sandbox.transferwise.tech/oauth/token', {
	// 		method: 'POST',
	// 		headers: myHeaders,
	// 		body: urlencoded,
	// 		redirect: 'follow'
	// 	})
	// 		.then((response) => response.text())
	// 		.then((result) => console.log(result))
	// 		.catch((error) => console.log('error', error))
	// }
</script>

<div>
	<div class="mb-4 space-y-4">
		<label class="label">
			<span>Email</span>
			<input class="input" type="text" name="firstName" value={email} disabled />
		</label>
	</div>

	<hr class="separator my-6" />

	<div
		class="space-y-4 rounded-lg px-4 py-2 outline outline-2 {stripeConnected
			? 'outline-success-500'
			: 'outline-error-500'} "
	>
		<p>Payment method</p>
		<!-- <svg
			class="np-logo-svg"
			xmlns="http://www.w3.org/2000/svg"
			width="106"
			height="24"
			fill="none"
			><path
				fill="#163300"
				d="M58.738.359h6.498l-3.27 23.322h-6.498L58.739.359Zm-8.193 0L46.16 13.794 44.247.359h-4.545L33.96 13.754 33.243.36h-6.299l2.193 23.322h5.223l6.458-14.75 2.272 14.75h5.143L56.725.359h-6.18Zm54.558 13.555H89.674c.08 3.03 1.894 5.023 4.565 5.023 2.014 0 3.608-1.077 4.844-3.13l5.208 2.368C102.501 21.702 98.729 24 94.08 24c-6.339 0-10.545-4.266-10.545-11.123C83.535 5.342 88.478 0 95.455 0c6.14 0 10.007 4.146 10.007 10.605 0 1.076-.12 2.152-.359 3.309Zm-5.78-4.466c0-2.71-1.516-4.425-3.947-4.425-2.512 0-4.585 1.794-5.144 4.425h9.09ZM6.632 7.387 0 15.139h11.844l1.33-3.655H8.1l3.1-3.586.01-.095-2.016-3.471h9.072l-7.032 19.35h4.812L24.538.358H2.6l4.033 7.028Zm69.168-2.364c2.292 0 4.3 1.233 6.055 3.346l.921-6.575C81.143.688 78.93 0 76 0c-5.82 0-9.09 3.409-9.09 7.734 0 3 1.675 4.834 4.426 6.02l1.315.598c2.452 1.047 3.11 1.565 3.11 2.671 0 1.146-1.106 1.874-2.79 1.874-2.782.01-5.034-1.415-6.728-3.847l-.94 6.699C67.234 23.22 69.708 24 72.97 24c5.532 0 8.93-3.19 8.93-7.615 0-3.01-1.335-4.943-4.704-6.458l-1.435-.678c-1.994-.887-2.671-1.375-2.671-2.352 0-1.056.927-1.874 2.71-1.874Z"
			></path></svg
		>
		<ul class="ml-8 list-disc">
			<li>Use your Wise account to transfer your funds</li>
			<li>Single click to connect</li>
		</ul>
		<button on:click={connectWise} class="variant-filled-primary btn">Connect with Wise</button> -->
		<ul class="ml-8 list-disc">
			<li>Connect directly to your bank account</li>
			<li>Payouts within 5 business days</li>
		</ul>
		<div class="1 flex items-center gap-x-1">
			{#if stripeConnected}
				<LucideShieldCheck size="32" class="fill-success-200 text-success-600" />
				<p>Account connected</p>
				<button class="variant-glass-surface btn ml-4">Modify</button>
			{:else}
				<LucideShieldX size="32" class="fill-error-200 text-error-600" />
				<form
					action={route('createAccount /dashboard/profile/account', langParams())}
					method="post"
					use:enhance
				>
					<button class="variant-filled-primary btn">Connect Bank Account</button>
				</form>
			{/if}
		</div>
	</div>
</div>
