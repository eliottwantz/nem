<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import type { Subscription } from '$lib/api/api.gen'
	import Layout from '$lib/components/Layout.svelte'
	import TeacherProfile from '$lib/components/Profile/TeacherProfile.svelte'
	import type { StripeSubscriptionRequest } from '$lib/server/stripe'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	export let data

	let planId = $page.url.searchParams.get('plan-id')
	let sub = data.subscriptions.find((s) => s.id === planId)
	let pricePerMonth: number
	let priceWithFees: number
	let total: number

	const modalStore = getModalStore()
	const toastStore = getToastStore()
	onMount(async () => {
		modalStore.close()
		if (!sub) {
			await goto($page.url.pathname)
			return
		}
		if ($page.url.searchParams.get('subscribe') === 'success') {
			toastStore.trigger({
				message: 'Subscription successful',
				background: 'bg-success-500'
			})
		}
		if ($page.url.searchParams.get('subscribe') === 'success') {
			toastStore.trigger({
				message: 'Subscription successful',
				background: 'bg-success-500'
			})
		}
		pricePerMonth = sub.hours * data.teacher.hourRate
		priceWithFees = (pricePerMonth * 2.5) / 100 // 2.5% transaction fee
		total = priceWithFees + pricePerMonth
	})

	async function takeSubscription() {
		try {
			const res = await fetch(`${$page.url.pathname}`, {
				method: 'POST',
				body: JSON.stringify({
					teacherId: data.teacher.id,
					subscription: sub as Subscription,
					price: total,
					hours: sub!.hours
				} satisfies StripeSubscriptionRequest)
			})
			const resData = await res.json()
			if (!res.ok) {
				toastStore.trigger({
					message: resData.message,
					background: 'bg-error-500'
				})
				return
			}
			window.location.replace(resData.url)
		} catch (e) {
			console.log(e)
			toastStore.trigger({
				message: e instanceof Error ? e.message : 'Failed to schedule class',
				background: 'bg-error-500'
			})
		}
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Subscribe</h1>
	<div class="space-y-4">
		<div class="flex w-full flex-col gap-8 border-b pb-8 pt-0">
			<div class="flex flex-col items-center justify-around gap-4 md:flex-row">
				<TeacherProfile teacher={data.teacher} />
			</div>
		</div>
		{#if sub}
			<p class="text-lg lg:text-xl">
				You will get <strong class="text-2xl lg:text-3xl">{sub.hours} </strong><strong>
					hours</strong
				> per month
			</p>
			<div class="grid grid-cols-[1fr_auto]">
				<div class="flex flex-col gap-y-2">
					<p class="text-base lg:text-xl">
						{sub.hours} hours x {data.teacher.hourRate} USD / h
					</p>
					<p class="text-base lg:text-xl">
						Transaction fee <span class="text-xs lg:text-sm">(2.5%)</span>
					</p>
					<div class="flex flex-col pt-4">
						<p class="text-xl lg:text-2xl">Total</p>
						<p class="text-sm">Billed every month</p>
					</div>
				</div>
				<div class="flex flex-col gap-y-2">
					<p class="text-right text-base lg:text-xl">{pricePerMonth} USD</p>
					<p class="text-right text-base lg:text-xl">
						{priceWithFees} USD
					</p>
					<p class="pt-4 text-right text-base lg:text-2xl">{total} USD</p>
				</div>
			</div>
			<button class="variant-filled-primary btn w-full" on:click={takeSubscription}>
				Go to payment page
			</button>
		{/if}
	</div>
</Layout>
