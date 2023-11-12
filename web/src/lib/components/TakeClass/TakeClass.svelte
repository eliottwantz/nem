<script lang="ts">
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import type { Class, Teacher, TimeSlot } from '$lib/api/api.gen'
	import { takeClassStore } from '$lib/stores/takeClassStore'
	import {
		ListBox,
		ListBoxItem,
		Step,
		Stepper,
		getModalStore,
		getToastStore
	} from '@skeletonlabs/skeleton'
	import {
		availabilityToCalendarEntryOneHourBlock,
		type CalendarEvent,
		type CalendarInteractEvent
	} from '../Calendar'
	import Calendar from '../Calendar/Calendar.svelte'

	export let teacher: Teacher
	export let classes: Class[]
	export let availabilities: TimeSlot[]
	export let isTrial: boolean | undefined = undefined
	$: if (isTrial) $takeClassStore.selectedIsPrivate = isTrial

	const toastStore = getToastStore()
	const modalStore = getModalStore()

	$: lockedLanguage = !$takeClassStore.selectedLanguage
	$: lockedTopic = !$takeClassStore.selectedTopic
	$: lockedEvent = !$takeClassStore.selectedEvent
	$: console.log('selectedLanguage', $takeClassStore.selectedLanguage)
	$: console.log('selectedTopic', $takeClassStore.selectedTopic)
	$: console.log('selectedIsPrivate', $takeClassStore.selectedIsPrivate)
	$: console.log('selectedTimeSlot', $takeClassStore.selectedEvent)
	$: topics = teacher.topicsTaught
	$: console.log('topics', topics)
	$: events = availabilities
		.filter((a) => {
			const matchClass = classes.find((c) => c.startAt === a.startAt && c.endAt === a.endAt)
			if (!matchClass) return true
			return (
				matchClass.language === $takeClassStore.selectedLanguage &&
				matchClass.topic === $takeClassStore.selectedTopic
			)
		})
		.map((a) => availabilityToCalendarEntryOneHourBlock(a))
		.reduce((a, b) => [...a, ...b], [] as CalendarEvent[])
	$: console.log('events', events)

	async function selectClass(cal: any, info: CalendarInteractEvent) {
		console.log('Time slot selected for class', info)
		if ($takeClassStore.selectedEvent) {
			const event: CalendarEvent = {
				...$takeClassStore.selectedEvent.event,
				backgroundColor: '#fbdc90'
			}
			cal.updateEvent(event)
		}
		$takeClassStore.selectedEvent = info
		const event: CalendarEvent = {
			...info.event,
			backgroundColor: '#01c4a9'
		}
		cal.updateEvent(event)
	}

	async function scheduleClass() {
		if (takeClassStore.isInValid()) return

		if (isTrial) {
			try {
				const res = await fetch(`${$page.url.pathname}/take-trial-class`, {
					method: 'POST',
					body: JSON.stringify($takeClassStore)
				})
				const data = await res.json()
				if (!res.ok) {
					toastStore.trigger({
						message: data.message,
						background: 'bg-error-500'
					})
					return
				}
				window.location.replace(data.url)
			} catch (e) {
				console.log(e)
				toastStore.trigger({
					message: e instanceof Error ? e.message : 'Failed to schedule class',
					background: 'bg-error-500'
				})
			}
		} else {
			const res = await safeFetch(
				fetchers.publicService(fetch).createOrJoinClass({
					req: {
						isPrivate: $takeClassStore.selectedIsPrivate,
						isTrial: false,
						language: $takeClassStore.selectedLanguage!,
						name: `${$takeClassStore.selectedLanguage} - ${$takeClassStore.selectedTopic}`,
						timeSlotId: $takeClassStore.selectedEvent!.event.id,
						topic: $takeClassStore.selectedTopic!,
						userId: $page.data.user.id
					}
				})
			)
			if (!res.ok) {
				toastStore.trigger({
					message: res.cause,
					background: 'bg-error-500'
				})
			} else {
				toastStore.trigger({
					message: 'Class scheduled',
					background: 'bg-success-500'
				})
			}
			modalStore.close()
			window.location.replace('/dashboard/student/classes')
		}
	}
</script>

<div class="card text-token mt-2 w-full max-w-3xl p-4">
	<Stepper
		on:step={console.log}
		stepTerm="->"
		buttonBackLabel="Previous"
		buttonNextLabel="Next"
		buttonCompleteLabel="Checkout"
		on:complete={scheduleClass}
	>
		<Step locked={lockedLanguage}>
			<svelte:fragment slot="header">Teaching Language</svelte:fragment>
			<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
				{#each new Set(teacher.spokenLanguages.map((l) => l.language)) as language}
					<ListBoxItem
						bind:group={$takeClassStore.selectedLanguage}
						name={language}
						value={language}
					>
						{language}
					</ListBoxItem>
				{/each}
			</ListBox>
		</Step>
		<Step locked={lockedTopic}>
			<svelte:fragment slot="header">Topic</svelte:fragment>
			<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
				{#each topics.filter((t) => t !== $takeClassStore.selectedLanguage) as topic}
					<ListBoxItem
						bind:group={$takeClassStore.selectedTopic}
						name={topic}
						value={topic}
					>
						{topic}
					</ListBoxItem>
				{/each}
			</ListBox>
		</Step>
		{#if !isTrial}
			<Step>
				<svelte:fragment slot="header">Private?</svelte:fragment>
				<input
					class="checkbox"
					type="checkbox"
					name="isPrivate"
					bind:checked={$takeClassStore.selectedIsPrivate}
				/>
			</Step>
		{/if}
		<Step locked={lockedEvent}>
			<svelte:fragment slot="header">Time slots</svelte:fragment>
			{#if availabilities.length > 0}
				<Calendar calendarMode="selectCourse" {events} eventClick={selectClass} />
			{:else}
				<p>
					This teacher hasn't setup any available time slots. Refresh the page or try
					again later
				</p>
			{/if}
		</Step>
		<Step
			locked={!$takeClassStore.selectedLanguage ||
				!$takeClassStore.selectedTopic ||
				!$takeClassStore.selectedEvent}
		>
			<svelte:fragment slot="header">Summary</svelte:fragment>

			<p>Selected language: {$takeClassStore.selectedLanguage}</p>
			<p>Selected topic: {$takeClassStore.selectedTopic}</p>
			<p>Private class: {$takeClassStore.selectedIsPrivate ? 'Yes' : 'No'}</p>
			{#if $takeClassStore.selectedEvent}
				<p>
					Selected time slot: {new Date(
						$takeClassStore.selectedEvent.event.start
					).toLocaleString($page.data.user.preferedLanguage)} - {new Date(
						$takeClassStore.selectedEvent.event.end
					).toLocaleString($page.data.user.preferedLanguage)}
				</p>
			{/if}
		</Step>
	</Stepper>
</div>
