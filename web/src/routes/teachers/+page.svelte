<script lang="ts">
	import { page } from '$app/stores'
	import AutocompleteSelect from '$lib/components/AutocompleteSelect/AutocompleteSelect.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/TeacherProfile.svelte'
	import {
		SortTypeKeyToLabel,
		teachersFiltersStore,
		type SortType,
		SortLabelToTypeKey
	} from '$lib/stores/teachersFiltersStore'
	import { onMount } from 'svelte'
	import { SlideToggle } from '@skeletonlabs/skeleton'
	import { RangeSlider } from '@skeletonlabs/skeleton'
	import Dropdown from '$lib/components/Dropdown/Dropdown.svelte'

	export let data
	$: console.log('filters', $teachersFiltersStore)

	$: url = new URLSearchParams({
		topic: $teachersFiltersStore.topic,
		language: $teachersFiltersStore.language,
		priceMax: `${$teachersFiltersStore.priceMax}`,
		ratingMin: $teachersFiltersStore.ratingMin,
		topAgent: `${$teachersFiltersStore.isTopAgent}`,
		sortBy: SortLabelToTypeKey[$teachersFiltersStore.sortBy]
	})
	$: console.log('url', url.toString())

	onMount(() => {
		teachersFiltersStore.fromURL()
	})
</script>

<Layout>
	<h1 slot="title" class="h1">Find a Teacher</h1>

	<section class="flex w-full flex-col gap-y-4 py-6">
		<div class="flex gap-x-4">
			<div class="flex flex-col items-start gap-y-1">
				<span>Topic for class</span>
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
			<div class="flex flex-col items-start gap-y-1">
				<span class="">
					Max Price ${$teachersFiltersStore.priceMax === 45
						? '45+'
						: $teachersFiltersStore.priceMax}
				</span>
				<Dropdown>
					<div class="flex w-full gap-x-1">
						<span>1</span>
						<RangeSlider
							class="w-full"
							accent="accent-primary-500"
							name="slide"
							min={1}
							max={45}
							bind:value={$teachersFiltersStore.priceMax}
						/>
						<span>45+</span>
					</div>
				</Dropdown>
			</div>
			<div class="flex flex-col items-start gap-y-1">
				<span>TopAgent</span>
				<SlideToggle
					size="lg"
					active="bg-primary-500"
					name="slide"
					bind:checked={$teachersFiltersStore.isTopAgent}
				/>
			</div>
		</div>
		<div class="flex gap-x-4">
			<div class="flex flex-col items-start gap-y-1">
				<span class="">Sort by</span>
				<AutocompleteSelect
					placeholder="Sort by"
					rawData={Object.values(SortTypeKeyToLabel)}
					bind:selectedVal={$teachersFiltersStore.sortBy}
				/>
			</div>
			<a class="variant-filled-primary btn self-end" href={$page.url.pathname + '?' + url}>
				Search
			</a>
		</div>
	</section>
	<p><strong>{data.teachers.length}</strong> out of <strong>{data.total}</strong></p>

	<div class="flex w-full flex-col gap-y-4">
		{#each data.teachers as teacher}
			<Profile shortForm={true} {teacher} />
		{/each}
	</div>
</Layout>
