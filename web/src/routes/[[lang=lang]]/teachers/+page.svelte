<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import Link from '$components/Link.svelte'
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
	import { ArrowUpToLine, Menu, Search, X } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let data

	let isFiltersOpened = false

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
		scrollTop()
	})

	async function scrollTop() {
		const doc = document.getElementById('page') as HTMLDivElement
		setTimeout(() => doc.scrollTo({ top: 0, behavior: 'smooth' }))
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Find a Teacher</h1>

	<section class="hidden w-full flex-col gap-y-4 py-6 lg:flex">
		<div class="flex justify-evenly gap-x-4">
			<div class="flex w-full flex-col items-start gap-y-1">
				<span class="text-lg font-bold">Topic for class</span>
				<AutocompleteSelect
					placeholder="Topic for class"
					rawData={data.topics}
					bind:selectedVal={$teachersFiltersStore.topic}
				/>
			</div>
			<div class="flex w-full flex-col items-start gap-y-1">
				<span class="text-lg font-bold">Class taught in</span>
				<AutocompleteSelect
					placeholder="Class taught in"
					rawData={data.languages}
					bind:selectedVal={$teachersFiltersStore.language}
				/>
			</div>
			<div class="flex w-full flex-col items-start gap-y-1">
				<span class="text-lg font-bold">
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
		</div>
		<div class="flex justify-evenly gap-x-4">
			<div class="flex w-full flex-col items-start gap-y-1">
				<span class="text-lg font-bold">Sort by</span>
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
			<div class="flex w-full flex-col items-start gap-y-1">
				<span class="text-lg font-bold">Search by name</span>
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
			<div class="flex w-full flex-col items-start gap-y-1">
				<span class="text-lg font-bold">TopAgent only</span>
				<SlideToggle
					size="lg"
					active="bg-primary-500"
					name="slide"
					bind:checked={$teachersFiltersStore.isTopAgent}
				/>
			</div>
		</div>
		<Link class="variant-filled-primary btn w-full max-w-2xl self-center" href={url}>
			Search
		</Link>
	</section>

	<section class="flex w-full flex-col gap-y-4 py-6 lg:hidden">
		<div class="flex flex-col items-start gap-y-1">
			<span class="text-lg font-bold">Topic for class</span>
			<div class="flex w-full items-center gap-x-2">
				<AutocompleteSelect
					placeholder="Topic for class"
					rawData={data.topics}
					bind:selectedVal={$teachersFiltersStore.topic}
				/>
				<button on:click={() => (isFiltersOpened = true)} class="variant-ghost btn">
					<Menu class="h-6 w-6" />
				</button>
			</div>
		</div>

		<div
			class="left-0 top-0 z-[200] h-[100svh] w-full bg-surface-50 p-4 {isFiltersOpened
				? 'fixed'
				: 'hidden'}"
		>
			<div class="container mx-auto">
				<div class="mb-2 flex w-full items-center justify-between">
					<h2 class="justify-self-center text-3xl font-bold">Filters</h2>
					<div class="flex items-center">
						<button
							class="text-lg underline"
							on:click={() => teachersFiltersStore.reset()}>Clear all</button
						>
						<button class="btn" on:click={() => (isFiltersOpened = false)}>
							<X class="h-6 w-6" />
						</button>
					</div>
				</div>
				<div class="flex flex-col items-start gap-y-4">
					<div class="flex w-full flex-col items-start gap-y-1">
						<span class="text-lg font-bold">Class taught in</span>
						<AutocompleteSelect
							placeholder="Class taught in"
							rawData={data.languages}
							bind:selectedVal={$teachersFiltersStore.language}
						/>
					</div>
					<div class="flex w-full flex-col items-start gap-y-1">
						<span class="text-lg font-bold">
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
					<div class="flex w-full items-center justify-between">
						<span class="text-lg font-bold">
							<strong class="text-primary-600">TopAgent</strong>
							only
						</span>
						<SlideToggle
							size="md"
							active="bg-primary-500"
							name="slide"
							bind:checked={$teachersFiltersStore.isTopAgent}
						/>
					</div>
					<div class="flex w-full flex-col items-start gap-y-1">
						<span class="text-lg font-bold">Sort by</span>
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
					<div class="flex w-full flex-col items-start gap-y-1">
						<span class="text-lg font-bold">Search by name</span>
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
								type="text"
								placeholder="Search by name"
								bind:value={$teachersFiltersStore.firstName}
								class="input"
							/>
						</div>
					</div>
				</div>
				<button
					class="variant-filled-primary btn my-4 w-full"
					on:click={() => {
						isFiltersOpened = false
						goto(url)
					}}
				>
					Search
				</button>
			</div>
		</div>

		<Link class="variant-filled-primary btn w-full" href={url}>Search</Link>
	</section>

	<strong class="mb-4 text-xl">{data.teachers.count} teachers available</strong>

	<div class="flex w-full flex-col gap-y-4">
		{#each data.teachers.teachers as teacher}
			<Profile shortForm={true} {teacher} />
		{/each}
	</div>

	<div class="mt-4 flex flex-col items-center gap-y-4">
		<div>
			{#each Array.from({ length: totalPages }) as _, idx}
				<Link
					class="text-xl hover:underline {currentPage === idx
						? 'font-semibold text-primary-700'
						: ''}"
					href={url.replace(`page=${currentPage}`, `page=${idx}`)}
					on:click={scrollTop}
				>
					{idx + 1}
				</Link>
			{/each}
		</div>
		<button class="variant-glass btn flex items-center gap-x-2" on:click={scrollTop}>
			<span>Back to top</span>
			<ArrowUpToLine class="h-5 w-5" />
		</button>
	</div>
</Layout>
