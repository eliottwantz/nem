<script lang="ts">
	import { proficienciesMeaning } from '$lib/schemas/profile'
	import { Proficiency, type SpokenLanguage } from '@prisma/client'
	import { TrashIcon } from 'lucide-svelte'

	export let availableLanguages: SpokenLanguage[]
	export let spokenLanguages: SpokenLanguage[]
	let languages = (JSON.parse(JSON.stringify(availableLanguages)) as SpokenLanguage[]).sort(
		(a, b) => a.language.localeCompare(b.language)
	)
	$: selectableLanguages = languages.filter(
		(l) => !spokenLanguages.map((l) => l.language).includes(l.language)
	)

	$: console.log('languages', languages)
	$: console.log('spokenLanguages', spokenLanguages)
	$: console.log('selectableLanguages', selectableLanguages)

	function add() {
		if (selectableLanguages.length === 0) return
		spokenLanguages = spokenLanguages.concat(selectableLanguages[0])
	}

	function remove(index: number, lang: string) {
		console.log(index, lang)
		spokenLanguages.splice(index, 1)
		spokenLanguages = spokenLanguages
	}
</script>

<div>
	<div class="grid grid-cols-2">
		<p>Spoken Languages</p>
		<p>Proficiency Level</p>
	</div>

	{#each spokenLanguages as spokenL, i}
		<div class="grid grid-cols-2 gap-2">
			<div>
				<select bind:value={spokenL.language} class="select">
					{#each languages as language}
						<option disabled={!selectableLanguages.includes(language)} value={language}>
							{language.language}
						</option>
					{/each}
				</select>
			</div>
			<div class="flex items-center gap-2">
				<select bind:value={spokenL.proficiency} class="select">
					{#each Object.values(Proficiency) as p}
						<option value={p}>{p} - {proficienciesMeaning[p]}</option>
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
		<button class="mt-4 font-semibold" type="button" on:click={add}> Add a language </button>
	{/if}
</div>
