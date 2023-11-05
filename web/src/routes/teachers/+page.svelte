<script lang="ts">
	import { page } from '$app/stores'
	import AutocompleteSelect from '$lib/components/AutocompleteSelect/AutocompleteSelect.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/TeacherProfile.svelte'
	import { teachersFiltersStore } from '$lib/stores/teachersFiltersStore'
	import { onMount } from 'svelte'
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import { RangeSlider } from '@skeletonlabs/skeleton'

	export let data
	$: console.log('filters', $teachersFiltersStore)

	$: url = new URLSearchParams({
		topic: $teachersFiltersStore.topic,
		language: $teachersFiltersStore.language,
		priceMax: `${$teachersFiltersStore.priceMax}`,
		ratingMin: $teachersFiltersStore.ratingMin,
		topAgent: `${$teachersFiltersStore.isTopAgent}`
	})
	$: console.log('url', url.toString())

	onMount(() => {
		teachersFiltersStore.fromURL()
	})
</script>

<Layout>
	<h1 slot="title" class="h1">Find a Teacher</h1>

	<section class="flex w-full justify-between gap-x-4">
		<div class="flex w-full flex-wrap items-start justify-start gap-x-4 py-6">
			<div class="flex flex-col items-start gap-y-1">
				<span class="flex-1">Topic for class</span>
				<AutocompleteSelect
					placeholder="Topic for class"
					rawData={data.topics}
					bind:selectedVal={$teachersFiltersStore.topic}
				/>
			</div>
			<div class="flex flex-col items-start gap-y-1">
				<span class="">Class taught in</span>
				<AutocompleteSelect
					placeholder="Class taught in"
					rawData={data.languages}
					bind:selectedVal={$teachersFiltersStore.language}
				/>
			</div>
			<div class="flex h-full flex-col items-start gap-y-1">
				<span class="flex-1">
					Max Price ${$teachersFiltersStore.priceMax === 45
						? '45+'
						: $teachersFiltersStore.priceMax}
				</span>
				<RangeSlider
					accent="bg-primary-500"
					name="slide"
					min={1}
					max={45}
					bind:value={$teachersFiltersStore.priceMax}
				/>
			</div>
			<div class="flex h-full flex-col items-start gap-y-1">
				<span class="flex-1">TopAgent</span>
				<SlideToggle
					size="sm sm:md"
					active="bg-primary-500"
					name="slide"
					bind:checked={$teachersFiltersStore.isTopAgent}
				/>
			</div>
		</div>
		<a class="variant-filled-primary btn self-center" href={$page.url.pathname + '?' + url}
			>Search</a
		>
	</section>
	<p><strong>{data.teachers.length}</strong> out of <strong>{data.total}</strong></p>

	<div class="flex w-full flex-col gap-y-4">
		{#each data.teachers as teacher}
			<Profile shortForm={true} {teacher} />
		{/each}
	</div>
</Layout>
