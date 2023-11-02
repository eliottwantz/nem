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
	$: minutes = Math.floor(($timer % 3600) / 60)
	$: seconds = Math.floor($timer % 60)
	$: minname = minutes > 1 ? 'mins' : 'min'
</script>

<p>
	<span class="font-semibold">{hours.toString().padStart(2, '0')}</span>h
	<span class="font-semibold">{minutes.toString().padStart(2, '0')}</span>{minname}
	<span class="font-semibold">{seconds.toString().padStart(2, '0')}</span>s
</p>
