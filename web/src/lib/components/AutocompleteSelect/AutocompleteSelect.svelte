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
	export let selectedVal: string | undefined
	let input: HTMLInputElement
	let showDropdown = false

	$: val = selectedVal ?? ''

	function onSelect(event: CustomEvent<AutocompleteOption<string>>): void {
		oldVal = val
		val = event.detail.label
		selectedVal = event.detail.value
		showDropdown = false
	}
	function onClick() {
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

<div class="relative w-full">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="input-group grid-cols-[1fr_auto]">
		<input
			class="input text-lg lg:p-4"
			type="search"
			name="topic"
			autocomplete="off"
			on:pointerdown={onClick}
			bind:this={input}
			bind:value={val}
			{placeholder}
		/>
		<div on:click={onClick}>
			<ArrowDown />
		</div>
	</div>
	<div
		class="card z-50 max-h-48 w-full overflow-y-auto bg-white p-4"
		class:hidden={!showDropdown}
		class:absolute={showDropdown}
		tabindex="-1"
		use:clickOutside
	>
		<Autocomplete bind:input={val} {options} on:selection={onSelect} />
	</div>
</div>
