<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import type { Class, Teacher, TimeSlot } from '$lib/api/api.gen'
	import { userStore } from '$lib/stores/user'
	import {
		ListBox,
		ListBoxItem,
		Step,
		Stepper,
		getModalStore,
		getToastStore
	} from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import {
		availabilityToCalendarEntryOneHourBlock,
		type CalendarEvent,
		type CalendarInteractEvent
	} from '../Calendar'
	import Calendar from '../Calendar/Calendar.svelte'

	export let teacher: Teacher
	export let classes: Class[]
	export let availabilities: TimeSlot[]

	const toastStore = getToastStore()
	const modalStore = getModalStore()

	let selectedLanguage: string
	let selectedTopic: string
	let selectedIsPrivate: boolean = false
	let selectedEvent: CalendarInteractEvent | undefined

	$: lockedLanguage = !selectedLanguage
	$: lockedTopic = !selectedTopic
	$: lockedEvent = !selectedEvent
	$: console.log('selectedLanguage', selectedLanguage)
	$: console.log('selectedTopic', selectedTopic)
	$: console.log('selectedIsPrivate', selectedIsPrivate)
	$: console.log('selectedTimeSlot', selectedEvent)
	$: topics = teacher.topicsTaught
	$: console.log('topics', topics)
	$: events = availabilities
		.filter((a) => !classes.map((c) => c.startAt).includes(a.startAt))
		.map((a) => availabilityToCalendarEntryOneHourBlock(a))
		.reduce((a, b) => [...a, ...b], [] as CalendarEvent[])
	$: console.log('events', events)

	async function selectClass(cal: any, info: CalendarInteractEvent) {
		console.log('Time slot selected for class', info)
		if (selectedEvent) {
			const event: CalendarEvent = {
				...selectedEvent.event,
				backgroundColor: '#fbdc90'
			}
			cal.updateEvent(event)
		}
		selectedEvent = info
		const event: CalendarEvent = {
			...info.event,
			backgroundColor: '#01c4a9'
		}
		cal.updateEvent(event)
	}

	async function orderLearn() {
		if (
			!selectedLanguage ||
			!selectedTopic ||
			selectedIsPrivate === undefined ||
			!selectedEvent
		)
			return

		if (!$page.data.session) return
		const res = await safeFetch(
			fetchers.classService(fetch, $page.data.session).createOrJoinClass({
				req: {
					isPrivate: selectedIsPrivate,
					language: selectedLanguage,
					topic: selectedTopic,
					name: `${selectedLanguage} - ${selectedTopic}`,
					timeSlotId: selectedEvent.event.id
				}
			})
		)
		if (!res.ok) {
			toastStore.trigger({
				message: res.cause,
				background: 'bg-error-500'
			})
			return
		}

		await goto('/dashboard/student/classes')
		await invalidateAll()
		modalStore.close()
	}
</script>

<div class="card text-token mt-2 w-full max-w-3xl p-4">
	<Stepper
		on:step={console.log}
		stepTerm={$t('learn.stepper.stepTerm')}
		buttonBackLabel={$t('learn.stepper.buttonBack')}
		buttonNextLabel={$t('learn.stepper.buttonNext')}
		buttonCompleteLabel={$t('learn.bookLearn')}
		on:complete={orderLearn}
	>
		<Step locked={lockedLanguage}>
			<svelte:fragment slot="header">{$t('learn.language-teach')}</svelte:fragment>
			<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
				{#each new Set(teacher.spokenLanguages.map((l) => l.language)) as language}
					<ListBoxItem bind:group={selectedLanguage} name={language} value={language}>
						{language}
					</ListBoxItem>
				{/each}
			</ListBox>
		</Step>
		<Step locked={lockedTopic}>
			<svelte:fragment slot="header">
				{$t('learn.topic')}
			</svelte:fragment>
			<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
				{#each topics as topic}
					<ListBoxItem bind:group={selectedTopic} name={topic} value={topic}>
						{topic}
					</ListBoxItem>
				{/each}
			</ListBox>
		</Step>
		<Step>
			<svelte:fragment slot="header">Private?</svelte:fragment>
			<input
				class="checkbox"
				type="checkbox"
				name="isPrivate"
				bind:checked={selectedIsPrivate}
			/>
		</Step>
		<Step locked={lockedEvent}>
			<svelte:fragment slot="header">Time slots</svelte:fragment>
			{#if availabilities.length > 0}
				<Calendar calendarMode="selectCourse" {events} eventClick={selectClass} />
			{:else}
				<p>This teacher hasn't setup any available time slots</p>
			{/if}
		</Step>
		<Step
			locked={!selectedLanguage ||
				!selectedTopic ||
				selectedIsPrivate === undefined ||
				!selectedEvent}
		>
			<svelte:fragment slot="header">Summary</svelte:fragment>

			<p>Selected language: {selectedLanguage}</p>
			<p>Selected topic: {selectedTopic}</p>
			<p>Private class: {selectedIsPrivate ? 'Yes' : 'No'}</p>
			{#if selectedEvent}
				<p>
					Selected time slot: {new Date(selectedEvent.event.start).toLocaleString(
						$userStore?.preferedLanguage
					)} - {new Date(selectedEvent.event.end).toLocaleString(
						$userStore?.preferedLanguage
					)}
				</p>
			{/if}
		</Step>
	</Stepper>
</div>
