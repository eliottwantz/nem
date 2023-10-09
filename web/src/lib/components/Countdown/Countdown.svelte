<script lang="ts">
	import { onMount } from 'svelte'
	import { tweened } from 'svelte/motion'

	export let timeountSec: number
	let timer = tweened(timeountSec)

	onMount(() => {
		const timerInterval = setInterval(() => {
			if ($timer > 0) $timer--
		}, 1000)

		return () => {
			clearInterval(timerInterval)
		}
	})

	$: hours = Math.floor($timer / 3600)
	$: minutes = Math.floor($timer / 60)
	$: minname = minutes > 1 ? 'mins' : 'min'
	$: seconds = Math.floor($timer - minutes * 60)
</script>

<p>
	<span class="font-semibold text-primary-500">{hours}</span>h
	<span class="font-semibold text-primary-500">{minutes}</span>{minname}
	<span class="font-semibold text-primary-500">{seconds}</span>s
</p>
