<script lang="ts">
	import type { SpokenLanguages } from '$lib/schemas/profile'
	import { Proficiency } from '@prisma/client'
	import { ExternalLink, TrashIcon } from 'lucide-svelte'

	export let allLanguages: string[]
	export let spokenLanguages: SpokenLanguages
	let languages = (JSON.parse(JSON.stringify(allLanguages)) as string[]).sort((a, b) =>
		a.localeCompare(b)
	)
	$: selectableLanguages = languages.filter(
		(l) => !spokenLanguages.map((l) => l.language).includes(l)
	)

	$: console.log('languages', languages)
	$: console.log('selectableLanguages', selectableLanguages)
	$: console.log('spokenLanguages', spokenLanguages)

	function add() {
		if (selectableLanguages.length === 0) return
		spokenLanguages = spokenLanguages.concat({
			language: selectableLanguages[0],
			proficiency: Proficiency.native
		})
	}

	function remove(index: number, lang: string) {
		console.log(index, lang)
		spokenLanguages.splice(index, 1)
		spokenLanguages = spokenLanguages
	}
</script>

<div>
	<div class="mb-2 grid grid-cols-2 gap-2 px-1">
		<p class="underline">Spoken Languages</p>
		<p class="underline">Proficiency Level</p>
	</div>

	{#each spokenLanguages as spokenL, i}
		<div class="grid grid-cols-2 gap-2">
			<div>
				<select bind:value={spokenL.language} class="select">
					{#each languages as language}
						<option disabled={!selectableLanguages.includes(language)} value={language}>
							{language}
						</option>
					{/each}
				</select>
			</div>
			<div class="flex items-center gap-2">
				<select bind:value={spokenL.proficiency} class="select">
					{#each Object.values(Proficiency) as p}
						<option value={p}>{p}</option>
					{/each}
				</select>
				<button
					on:click={() => remove(i, spokenL.language)}
					type="button"
					class="variant-filled-error btn-icon h-8 w-8"
				>
					<TrashIcon />
				</button>
			</div>
		</div>
	{/each}
	{#if selectableLanguages.length > 0}
		<div class="mt-4 flex items-center gap-x-2">
			<button class="variant-outline-surface btn font-semibold" type="button" on:click={add}>
				Add a language
			</button>
			<a
				class="anchor flex gap-x-1"
				target="_blank"
				href="https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages#Common_reference_levels"
			>
				What are the proficiency levels?
				<ExternalLink size="16" />
			</a>
		</div>
	{/if}
</div>
