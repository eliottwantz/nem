<script lang="ts">
	import { page } from '$app/stores'
	import Link from '$components/Link.svelte'
	import type { Subscription, Teacher } from '$lib/api/api.gen'

	export let teacher: Teacher
	export let subscriptions: Subscription[]
	console.log('subscriptions', subscriptions)
</script>

<section class="card bg-white p-8">
	<h1 class="h1 mb-8 text-center">Our Plans</h1>
	<div
		id="main"
		class="[&>*:nth-child(4)]:border-1 [&>*:nth-child(5)]:border-1 grid grid-cols-1 grid-rows-5 gap-4 sm:grid-cols-6 sm:grid-rows-2 lg:grid-cols-5 lg:grid-rows-1 [&>*:nth-child(3)]:border [&>*:nth-child(3)]:border-primary-500 [&>*:nth-child(4)]:border-primary-500 [&>*:nth-child(4)]:bg-primary-100 [&>*:nth-child(5)]:border-primary-500 [&>*:nth-child(5)]:bg-primary-100 [&>*:nth-child(5)]:shadow-2xl"
	>
		{#each subscriptions.sort((a, b) => a.hours - b.hours) as sub, i}
			<div
				class="card relative flex flex-col items-center gap-y-1 bg-surface-50 p-4 shadow-lg sm:col-span-2 sm:gap-y-4 lg:col-span-1 {i ===
				3
					? 'sm:col-start-2 '
					: ''} {i === 4 ? 'sm:col-start-4' : ''}"
			>
				{#if i === 2}
					<span
						class="variant-filled-primary badge absolute -top-3 left-1/2 z-10 w-min -translate-x-1/2 transform"
						>Most popular</span
					>
				{:else if i === 4}
					<span
						class="variant-filled-primary badge absolute -top-3 left-1/2 z-10 w-min -translate-x-1/2 transform"
						>Best value</span
					>
				{/if}
				<div class="flex items-center justify-center gap-x-2">
					<span>
						{#if i === 0}
							<img
								class="h-8 w-8 sm:h-12 sm:w-12"
								src="/magnifyingGlass.svg"
								alt="Magnifying Glass"
							/>
						{:else if i === 1}
							<img class="h-8 w-8 sm:h-12 sm:w-12" src="/book.svg" alt="Book" />
						{:else if i === 2}
							<img
								class="h-8 w-8 sm:h-12 sm:w-12"
								src="/airplane.svg"
								alt="Airplane"
							/>
						{:else if i === 3}
							<img class="h-8 w-8 sm:h-12 sm:w-12" src="/compass.svg" alt="Compass" />
						{:else}
							<img
								class="h-8 w-8 sm:h-12 sm:w-12"
								src="/graduation-cap.svg"
								alt="Graduation Cap"
							/>
						{/if}
					</span>
					<p class="sm:text-xl">{sub.name}</p>
				</div>
				<p class="sm:text-xl">
					<span class="text-md font-semibold">${teacher.hourRate}</span> / hour
				</p>
				<p><span class="font-bold sm:text-2xl">{sub.hours}h</span> / month</p>
				{#if i === 2}
					<Link
						href="{$page.url.pathname}/subscribe?plan-id={sub.id}"
						class="variant-filled-primary btn"
					>
						Subscribe
					</Link>
				{:else if i === 4}
					<Link
						href="{$page.url.pathname}/subscribe?plan-id={sub.id}"
						class="variant-outline-primary btn ring-2"
						>Subscribe
					</Link>
				{:else}
					<Link
						href="{$page.url.pathname}/subscribe?plan-id={sub.id}"
						class="variant-outline-primary btn ring-2"
					>
						Subscribe
					</Link>
				{/if}
			</div>
		{/each}
	</div>
</section>
