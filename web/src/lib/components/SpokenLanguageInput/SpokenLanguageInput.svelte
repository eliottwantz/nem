<script lang="ts">
	import {
		proficienciesMeaning,
		proficiencyLevels,
		type SpokenLanguages
	} from '$lib/schemas/profile'
	import { TrashIcon } from 'lucide-svelte'

	export let availableLanguages: string[]
	export let spokenLanguages: SpokenLanguages
	let languages = (JSON.parse(JSON.stringify(availableLanguages)) as string[]).sort((a, b) =>
		a.localeCompare(b)
	)
	$: selectableLanguages = languages.filter(
		(l) => !spokenLanguages.map((l) => l.language).includes(l)
	)

	$: console.log('languages', languages)
	$: console.log('spokenLanguages', spokenLanguages)

	function add() {
		if (selectableLanguages.length === 0) return
		spokenLanguages = spokenLanguages.concat({
			language: selectableLanguages[0],
			proficiency: proficiencyLevels[0]
		})
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
						<option disabled={!selectableLanguages.includes(language)} value={language}
							>{language}</option
						>
					{/each}
				</select>
			</div>
			<div class="flex items-center gap-2">
				<select bind:value={spokenL.proficiency} class="select">
					{#each proficiencyLevels as p}
						{#if p === 'Native'}
							<option value={p}>{p}</option>
						{:else}
							<option value={p}>{p} - {proficienciesMeaning[p]}</option>
						{/if}
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
