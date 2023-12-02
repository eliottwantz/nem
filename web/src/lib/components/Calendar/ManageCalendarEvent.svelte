<script lang="ts">
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte'
	import type {
		DeleteCalendarAvailability,
		UpdateCalendarAvailability
	} from '$lib/schemas/calendar'
	import { dayFromDate, timeFromDateHHMM } from '$lib/utils/datetime'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import type { CalendarEvent, CalendarInteractEvent, CalendarResizeInfo } from '.'
	import TimeInput from './TimeInput.svelte'
	import type { TimeSlot } from '@prisma/client'
	import { route } from '$lib/ROUTES'
	import { safeFetch } from '$lib/api'

	export let cal: any
	export let info:
		| (CalendarInteractEvent & { mode: 'click' })
		| (CalendarResizeInfo & { mode: 'resize' })
		| (CalendarResizeInfo & { mode: 'drag' })

	const modalStore = getModalStore()
	const toastStore = getToastStore()

	$: console.log('WANT TO ADD THIS EVENT', info)
	$: console.log('CAL', cal)

	let day: string = dayFromDate(info.event.start)
	let startTime: string = timeFromDateHHMM(info.event.start)
	let endTime: string = timeFromDateHHMM(info.event.end)

	const initialStart = info.event.start
	const initialEnd = info.event.end

	let errorMsg: string

	$: console.log('DAY', day)
	$: console.log('START TIME', startTime)
	$: console.log('END AT TIME', endTime)

	onMount(() => {
		if (endTime === '00:00') {
			// This means the user selected a time slot that ends at 00:00, so ignore the same day checks
			return
		}
		if (info.event.start.getDay() !== info.event.end.getDay()) {
			console.log('START AND END DAYS ARE DIFFERENT')
			cancel()

			toastStore.trigger({
				message: 'An availability cannot span multiple days',
				background: 'bg-error-500'
			})
		}
	})

	async function editEvent() {
		const reqBody: UpdateCalendarAvailability = {
			id: info.event.id,
			startAt: new Date(day + 'T' + startTime).toISOString(),
			endAt: new Date(day + 'T' + endTime).toISOString()
		}
		if (info.mode === 'click') {
			const sameDates =
				startTime === timeFromDateHHMM(initialStart) &&
				endTime === timeFromDateHHMM(initialEnd)
			if (sameDates) {
				errorMsg = 'No changes made'
				return
			}
		} else {
			const sameDates =
				info.event.start.toISOString() === info.oldEvent.start.toISOString() &&
				info.event.end.toISOString() === info.oldEvent.end.toISOString()
			if (sameDates) {
				errorMsg = 'No changes made'
				return
			}
		}

		const res = await safeFetch<TimeSlot[]>(
			fetch(route('PUT /api/teacher/availabilities/[id]', { id: info.event.id }), {
				method: 'PUT',
				body: JSON.stringify(reqBody)
			})
		)
		if (!res.ok) {
			errorMsg = res.error.message
			return
		}
		console.log('Modified event', info.event.id)
		if (res.data.length === 1) {
			const event: CalendarEvent = {
				...info.event,
				start: new Date(res.data[0].startAt),
				end: new Date(res.data[0].endAt)
			}
			cal.updateEvent(event)
		} else {
			// Delete old event
			cal.removeEventById(info.event.id)

			// Add new ones
			res.data.forEach((t) => {
				const event: CalendarEvent = {
					id: `${t.id}`,
					title: 'Available',
					backgroundColor: '#fbdc90',
					textColor: '#000',
					start: new Date(t.startAt),
					end: new Date(t.endAt),
					allDay: false,
					editable: true,
					startEditable: true,
					durationEditable: true
				}
				cal.addEvent(event)
			})
		}
		modalStore.close()
	}
	async function deleteEvent() {
		const reqBody: DeleteCalendarAvailability = {
			id: info.event.id
		}
		const res = await safeFetch(
			fetch(route('DELETE /api/teacher/availabilities/[id]', { id: info.event.id }), {
				method: 'DELETE',
				body: JSON.stringify(reqBody)
			})
		)
		if (!res.ok) {
			errorMsg = res.error.message
			return
		}
		console.log('Deleted event', info.event.id)
		cal.removeEventById(info.event.id)
		modalStore.close()
	}

	function cancel() {
		modalStore.close()
		if (info.mode !== 'click') {
			info.revert()
		}
	}
</script>

<div class="card space-y-4 p-8">
	<h2 class="h2">Modify your availability</h2>

	<div class="mt-4 flex flex-col gap-8">
		<div class="flex gap-4">
			<input class="input w-full" type="date" name="day" bind:value={day} />
			<TimeInput bind:startTime bind:endTime />
		</div>

		{#if errorMsg}
			<p class="text-red-500">{errorMsg}</p>
		{/if}

		<div class="flex justify-end gap-2">
			<button
				type="button"
				on:click={deleteEvent}
				class="variant-filled-error btn-icon self-start"
			>
				<DeleteIcon class="h-6 w-6" />
			</button>
			<button class="variant-ghost-surface btn" on:click={cancel}> Cancel </button>
			<button on:click={editEvent} class="variant-filled-primary btn">Confirm</button>
		</div>
	</div>
</div>
