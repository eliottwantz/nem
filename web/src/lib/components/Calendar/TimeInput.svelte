<script lang="ts">
	import { calendarTimes, isTimeAfter } from '.'

	export let startTime: string
	export let endTime: string

	$: endTimes = calendarTimes.filter((t) => isTimeAfter(startTime, t))
</script>

<select name="start" class="select" bind:value={startTime}>
	{#each calendarTimes as time}
		<option value={time}>{time}</option>
	{/each}
</select>
<span style="font-size: 2rem;"> - </span>
<select name="end" class="select" bind:value={endTime}>
	{#each endTimes as time}
		<option value={time}>{time}</option>
	{/each}
</select>
