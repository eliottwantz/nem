<script lang="ts">
	import { page } from '$app/stores'
	import { safeFetch } from '$lib/api'
	import { takeClassStore } from '$lib/stores/takeClassStore'
	import type { Class, SpokenLanguage, Teacher, TimeSlot, Topic } from '@prisma/client'
	import {
		ListBox,
		ListBoxItem,
		Step,
		Stepper,
		getModalStore,
		getToastStore
	} from '@skeletonlabs/skeleton'
	import type { JoinClassRequest } from '../../../routes/api/classes/join/+server'
	import {
		availabilityToCalendarEntryOneHourBlock,
		type CalendarEvent,
		type CalendarInteractEvent
	} from '../Calendar'
	import Calendar from '../Calendar/Calendar.svelte'
	import { route } from '$lib/ROUTES'

	export let teacher: Teacher & { topics: Topic[]; spokenLanguages: SpokenLanguage[] }
	$: console.log('THE TEACHER SHIT', teacher)
	export let classes: (Class & { timeSlot: TimeSlot })[]
	export let availabilities: TimeSlot[]
	export let isTrial: boolean = false
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
	$: events = availabilities
		.filter((a) => {
			const matchClass = classes.find(
				(c) => c.timeSlot.startAt === a.startAt && c.timeSlot.endAt === a.endAt
			)
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
			const res = await safeFetch<{ url: string }>(
				fetch(`${$page.url.pathname}/take-trial-class`, {
					method: 'POST',
					body: JSON.stringify($takeClassStore)
				})
			)
			if (!res.ok) {
				toastStore.trigger({
					message: res.error.message,
					background: 'bg-error-500'
				})
				return
			}
			window.location.replace(res.data.url)
		} else {
			const res = await safeFetch(
				fetch(route('POST /api/classes/join'), {
					method: 'POST',
					body: JSON.stringify({
						isPrivate: $takeClassStore.selectedIsPrivate,
						isTrial: false,
						language: $takeClassStore.selectedLanguage!,
						name: `${$takeClassStore.selectedLanguage} - ${$takeClassStore.selectedTopic}`,
						timeSlotId: $takeClassStore.selectedEvent!.event.id,
						topic: $takeClassStore.selectedTopic!,
						userId: $page.data.user.id
					} satisfies JoinClassRequest)
				})
			)
			if (!res.ok) {
				toastStore.trigger({
					message: res.error.message,
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
				{#each new Set(teacher.spokenLanguages.map((l) => l.languageId)) as language}
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
				{#each teacher.topics
					.map((t) => t.topic)
					.filter((t) => t !== $takeClassStore.selectedLanguage) as topic}
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
