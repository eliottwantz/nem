<script lang="ts">
	export let files: FileList
	export let name: string
	let fileInput: HTMLInputElement
</script>

<div>
	<div class="w-0 h-0 overflow-hidden">
		<input {name} type="file" bind:this={fileInput} bind:files on:change />
	</div>
	<button
		type="button"
		class="btn variant-ringed-primary"
		disabled={$$restProps.disabled}
		on:click={() => fileInput.click()}
		on:keydown
		on:keyup
		on:keypress
	>
		<slot>Select a file</slot>
	</button>
</div>
