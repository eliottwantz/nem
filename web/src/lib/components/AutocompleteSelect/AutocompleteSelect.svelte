<script lang="ts">
	import type { AutocompleteOption } from '@skeletonlabs/skeleton'
	import { Autocomplete } from '@skeletonlabs/skeleton'
	import { ArrowDown, X } from 'lucide-svelte'

	export let rawData: string[]
	export let placeholder: string
	let options: AutocompleteOption<string>[] = rawData.map((s) => ({
		label: s.at(0)?.toUpperCase() + s.slice(1),
		value: s
	}))

	let val = ''
	let oldVal = ''
	export let selectedVal: string
	let input: HTMLInputElement
	let showDropdown = false

	$: console.log('selectedVal', selectedVal)

	$: val = selectedVal

	function onSelect(event: CustomEvent<AutocompleteOption<string>>): void {
		oldVal = val
		val = event.detail.label
		selectedVal = event.detail.value
		showDropdown = false
	}
	function onClick() {
		console.log('clickEEEEEEEEEEED')
		if (showDropdown) return
		oldVal = val
		val = ''
		showDropdown = true
	}
	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (
				!node.contains(event.target as Node) &&
				!input.contains(event.target as Node) &&
				showDropdown
			) {
				showDropdown = false
				val = oldVal
			}
		}

		document.addEventListener('click', handleClick, true)

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true)
			}
		}
	}
</script>

<div id="topic" class="relative">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="input-group grid-cols-[1fr_auto]">
		<input
			class="input"
			type="search"
			name="topic"
			on:pointerdown={onClick}
			bind:this={input}
			bind:value={val}
			{placeholder}
		/>
		{#if val}
			<div on:click={() => (selectedVal = '')}>
				<X />
			</div>
		{:else}
			<div on:click={onClick}>
				<ArrowDown />
			</div>
		{/if}
	</div>
	<div
		class="card left-0 z-50 max-h-48 w-full max-w-sm overflow-y-auto bg-white p-4"
		class:hidden={!showDropdown}
		class:absolute={showDropdown}
		tabindex="-1"
		use:clickOutside
	>
		<Autocomplete bind:input={val} {options} on:selection={onSelect} />
	</div>
</div>
