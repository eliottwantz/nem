<script lang="ts">
	import { ArrowDown } from 'lucide-svelte'

	export let val: string
	let triggerElem: HTMLElement
	let showDropdown = false

	function onClick() {
		showDropdown = !showDropdown
	}
	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (
				!node.contains(event.target as Node) &&
				!triggerElem.contains(event.target as Node) &&
				showDropdown
			) {
				showDropdown = false
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
	<div
		class="input-group grid-cols-[1fr_auto] px-3 py-2 lg:p-4"
		bind:this={triggerElem}
		on:click={onClick}
	>
		<div class="w-full text-lg">
			{val}
		</div>
		<div>
			<ArrowDown />
		</div>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="card z-50 max-h-48 w-full overflow-y-auto bg-white p-4"
		class:hidden={!showDropdown}
		class:absolute={showDropdown}
		tabindex="-1"
		use:clickOutside
	>
		<slot />
	</div>
</div>
