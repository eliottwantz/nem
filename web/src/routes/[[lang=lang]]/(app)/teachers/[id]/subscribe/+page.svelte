<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { safeFetch } from '$lib/api'
	import Layout from '$lib/components/Layout.svelte'
	import TeacherProfile from '$lib/components/Profile/TeacherProfile.svelte'
	import type { StripeSubscriptionRequest } from '$lib/server/stripe'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { LucideExternalLink } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let data

	let sub = data.subscription
	let pricePerMonth: number
	let priceWithFees: number
	let total: number

	const modalStore = getModalStore()
	const toastStore = getToastStore()
	onMount(async () => {
		modalStore.close()
		if (!sub) {
			toastStore.trigger({
				message: 'Subscription not found',
				background: 'bg-error-500'
			})
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
		priceWithFees = (pricePerMonth * 5) / 100 + 1 // 5% transaction fee + 1 USD
		total = priceWithFees + pricePerMonth
	})

	async function takeSubscription() {
		try {
			const res = await safeFetch<{ url: string }>(
				fetch(route('/teachers/[id]/subscribe', { id: $page.params.id }), {
					method: 'POST',
					body: JSON.stringify({
						teacherId: data.teacher.id,
						subscription: sub!,
						price: total,
						hours: sub!.hours
					} satisfies StripeSubscriptionRequest)
				})
			)
			if (!res.ok) {
				toastStore.trigger({
					message: res.error.message,
					background: 'bg-error-500'
				})
				return
			}
			window.location.replace(res.data.url)
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
	<h1 slot="title">Subscribe</h1>
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
					<p class="flex items-center gap-x-1 text-xs lg:text-sm">
						Transaction fee
						<a
							class="anchor flex gap-x-1 underline decoration-dotted underline-offset-4"
							target="_blank"
							href={route('/about', langParams())}
						>
							<span>(5%)</span>
							<LucideExternalLink size="14" />
						</a>
					</p>

					<div class="flex flex-col pt-4">
						<p class="text-xl lg:text-2xl">Total</p>
						<p class="text-sm">Billed every month</p>
					</div>
				</div>
				<div class="flex flex-col gap-y-2">
					<p class="text-right text-base lg:text-xl">{pricePerMonth} USD</p>
					<p class="text-right text-xs lg:text-sm">
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
