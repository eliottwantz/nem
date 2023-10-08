<script lang="ts">
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte'
	import {
		availableLanguages,
		proficienciesMeaning,
		proficiencyLevels,
		type SpokenLanguages
	} from '$lib/schemas/profile'

	export let spokenLanguages: SpokenLanguages
	let languages: string[] = (JSON.parse(JSON.stringify(availableLanguages)) as string[]).sort(
		(a, b) => a.localeCompare(b)
	)

	let langSelect: HTMLSelectElement
	let profSelect: HTMLSelectElement

	function addSpokenLanguage() {
		if (!spokenLanguages) {
			return
		}
		spokenLanguages = [
			//@ts-expect-error
			...spokenLanguages,
			{
				//@ts-expect-error
				language: langSelect.value,
				//@ts-expect-error
				proficiency: profSelect.value
			}
		]
		// Remove the added language from the available languages
		languages = languages
			.filter((l) => l !== langSelect.value)
			.sort((a, b) => a.localeCompare(b))
	}

	function removeSpokenLanguage(index: number, lang: string) {
		console.log(index, lang)
		if (!spokenLanguages) return
		spokenLanguages.splice(index, 1)
		spokenLanguages = spokenLanguages
		languages = [...languages, lang].sort((a, b) => a.localeCompare(b))
	}
</script>

{#if spokenLanguages}
	{#each spokenLanguages as spokenL, i}
		<ul>
			<li class="flex items-center gap-2">
				<div>
					<span>{spokenL.language}</span>
					<span class="variant-filled-success badge">{spokenL.proficiency}</span>
				</div>
				<button
					on:click={() => removeSpokenLanguage(i, spokenL.language)}
					type="button"
					class="variant-filled-error btn-icon h-5 w-5"
				>
					<DeleteIcon class="h-4 w-4" />
				</button>
			</li>
		</ul>
	{/each}
{/if}

<div class="flex gap-4">
	<div>
		<select bind:this={langSelect} class="select">
			{#each languages as language}
				<option value={language}>{language}</option>
			{/each}
		</select>
	</div>
	<div>
		<select bind:this={profSelect} class="select">
			{#each proficiencyLevels as p}
				{#if p === 'Native'}
					<option value={p}>{p}</option>
				{:else}
					<option value={p}>{p} - {proficienciesMeaning[p]}</option>
				{/if}
			{/each}
		</select>
	</div>
	<button
		disabled={languages.length === 0}
		class="variant-filled-surface btn"
		type="button"
		on:click={addSpokenLanguage}>Add</button
	>
</div>
