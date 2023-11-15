<script lang="ts">
	import type { CreateCalendarAvailability } from '$lib/schemas/calendar'
	import { dayFromDate, timeFromDateHHMM, timeToDateHHMM } from '$lib/utils/datetime'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import type { CalendarEvent, CalendarSelectInfo } from '.'
	import TimeInput from './TimeInput.svelte'
	import type { TimeSlot } from '@prisma/client'

	export let cal: any
	export let info: CalendarSelectInfo | undefined

	const modalStore = getModalStore()
	const toastStore = getToastStore()

	$: console.log('WANT TO ADD THIS EVENT', info)
	$: console.log('CAL', cal)

	let day: string = info ? dayFromDate(info.start) : dayFromDate(new Date())
	let startTime: string = info ? timeFromDateHHMM(info.start) : ''
	let endTime: string = info ? timeFromDateHHMM(info.end) : ''

	let errorMsg: string

	$: console.log('DAY', day)
	$: console.log('START TIME', startTime, timeToDateHHMM(startTime, day))
	$: console.log('END AT TIME', endTime, timeToDateHHMM(endTime, day))

	onMount(() => {
		if (endTime === '00:00') {
			// This means the user selected a time slot that ends at 00:00, so ignore the same day checks
			return
		}
		if (info && info.start.getDay() !== info.end.getDay()) {
			console.log('START AND END DAYS ARE DIFFERENT')
			modalStore.close()

			toastStore.trigger({
				message: 'An availability cannot span multiple days',
				background: 'bg-error-500'
			})
		}
	})

	async function addEvent() {
		try {
			const body: CreateCalendarAvailability = {
				startAt: new Date(day + 'T' + startTime).toISOString(),
				endAt: new Date(day + 'T' + endTime).toISOString()
			}
			const res:
				| { success: false; message: string }
				| { success: true; timeSlots: TimeSlot[] } = await (
				await fetch('/api/teacher/availabilities', {
					method: 'POST',
					body: JSON.stringify(body)
				})
			).json()
			if (!res.success) {
				errorMsg = res.message
				return
			}
			console.log('GOOOOOOOOOOOOOOOOOOOOOOOOOOOOD')
			console.log(res.timeSlots)
			res.timeSlots.forEach((t) => {
				const event: CalendarEvent = {
					id: `${t.id}`,
					title: 'Available',
					backgroundColor: '#fbdc90',
					textColor: '#000',
					start: t.startAt,
					end: t.endAt,
					allDay: false,
					editable: true,
					startEditable: true,
					durationEditable: true
				}
				cal.addEvent(event)
			})
			modalStore.close()
		} catch (error) {
			errorMsg = (error as Error).message
		}
	}
</script>

<div class="card space-y-4 p-8">
	<h2 class="h2 text-center">Add an availability</h2>

	<div class="mt-4 flex flex-col gap-8">
		<div class="flex gap-4">
			<input class="input" type="date" name="day" bind:value={day} />
			<TimeInput bind:startTime bind:endTime />
		</div>

		{#if errorMsg}
			<p class="text-red-500">{errorMsg}</p>
		{/if}

		<div class="flex justify-end gap-2">
			<button class="variant-ghost-surface btn" on:click={() => modalStore.close()}>
				Cancel
			</button>
			<button on:click={addEvent} class="variant-filled-primary btn">Confirm</button>
		</div>
	</div>
</div>
