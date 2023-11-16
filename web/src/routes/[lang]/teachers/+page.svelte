<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import AutocompleteSelect from '$lib/components/AutocompleteSelect/AutocompleteSelect.svelte'
	import Dropdown from '$lib/components/Dropdown/Dropdown.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/TeacherProfile.svelte'
	import {
		SortLabelToTypeKey,
		SortTypeKeyToLabel,
		teachersFiltersStore
	} from '$lib/stores/teachersFiltersStore'
	import { ListBox, ListBoxItem, RangeSlider, SlideToggle } from '@skeletonlabs/skeleton'
	import { Search } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let data
	console.log(data)

	const pageSize = data.take
	$: totalPages = Math.ceil(data.teachers.count / pageSize)
	$: currentPage = data.teachers.page

	let url: string
	$: {
		const u = new URLSearchParams()
		if ($teachersFiltersStore.topic) {
			u.append('topic', $teachersFiltersStore.topic)
		}
		if ($teachersFiltersStore.language) {
			u.append('language', $teachersFiltersStore.language)
		}
		if ($teachersFiltersStore.priceMax < 45) {
			u.append('priceMax', `${$teachersFiltersStore.priceMax}`)
		}
		if ($teachersFiltersStore.ratingMin) {
			u.append('ratingMin', `${$teachersFiltersStore.ratingMin}`)
		}
		if ($teachersFiltersStore.isTopAgent) {
			u.append('topAgent', `${$teachersFiltersStore.isTopAgent}`)
		}
		if ($teachersFiltersStore.firstName) {
			u.append('firstName', $teachersFiltersStore.firstName)
		}
		u.append('sortBy', SortLabelToTypeKey[$teachersFiltersStore.sortBy])
		u.append('page', `${currentPage}`)
		url = $page.url.pathname + '?' + u.toString()
	}

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
				<Dropdown
					val={`${$teachersFiltersStore.priceMax}${
						$teachersFiltersStore.priceMax === 45 ? '+' : ''
					}`}
				>
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
				<span>TopAgent only</span>
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
				<span>Sort by</span>
				<Dropdown bind:val={$teachersFiltersStore.sortBy}>
					<ListBox>
						{#each Object.values(SortTypeKeyToLabel) as label}
							<ListBoxItem
								bind:group={$teachersFiltersStore.sortBy}
								name="sortBy"
								value={label}>{label}</ListBoxItem
							>
						{/each}
					</ListBox>
				</Dropdown>
			</div>
			<div class="flex flex-col items-start gap-y-1">
				<span>Search by name</span>
				<div class="input-group grid-cols-[auto_1fr]">
					<div class="w-full lg:p-4">
						<Search />
					</div>
					<input
						on:keydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								goto(url)
							}
						}}
						type="search"
						placeholder="Search by name"
						bind:value={$teachersFiltersStore.firstName}
					/>
				</div>
			</div>

			<a class="variant-filled-primary btn self-end" href={url}> Search </a>
		</div>
	</section>

	<strong>{data.teachers.count} teachers available</strong>
	<div id="pagination">
		{#each Array.from({ length: totalPages }) as _, idx}
			<a
				class="text-lg hover:underline {currentPage === idx
					? 'font-semibold text-primary-700'
					: ''}"
				href={url.replace(`page=${currentPage}`, `page=${idx}`)}
			>
				{idx + 1}
			</a>
		{/each}
	</div>

	<div class="flex w-full flex-col gap-y-4">
		{#each data.teachers.teachers as teacher}
			<Profile shortForm={true} {teacher} />
		{/each}
	</div>
</Layout>
