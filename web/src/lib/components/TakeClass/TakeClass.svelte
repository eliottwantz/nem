<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
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
	import { takeClassStore } from '$lib/stores/takeClassStore'

	export let teacher: Teacher
	export let classes: Class[]
	export let availabilities: TimeSlot[]

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

		await goto(`/teachers/${teacher.id}/take-class`)
		await invalidateAll()
		modalStore.close()

		// if (!$page.data.session) return
		// const res = await safeFetch(
		// 	fetchers.classService(fetch, $page.data.session).createOrJoinClass({
		// 		req: {
		// 			isPrivate: $takeClassStore.selectedIsPrivate,
		// 			language: $takeClassStore.selectedLanguage!,
		// 			topic: $takeClassStore.selectedTopic!,
		// 			name: `${$takeClassStore.selectedLanguage} - ${$takeClassStore.selectedTopic}`,
		// 			timeSlotId: $takeClassStore.selectedEvent!.event.id
		// 		}
		// 	})
		// )
		// if (!res.ok) {
		// 	toastStore.trigger({
		// 		message: res.cause,
		// 		background: 'bg-error-500'
		// 	})
		// 	return
		// }

		// await goto('/dashboard/student/classes')
		// await invalidateAll()
		// modalStore.close()
	}
</script>

<div class="card text-token mt-2 w-full max-w-3xl p-4">
	<Stepper
		on:step={console.log}
		stepTerm={$t('learn.stepper.stepTerm')}
		buttonBackLabel={$t('learn.stepper.buttonBack')}
		buttonNextLabel={$t('learn.stepper.buttonNext')}
		buttonCompleteLabel={$t('learn.bookLearn')}
		on:complete={scheduleClass}
	>
		<Step locked={lockedLanguage}>
			<svelte:fragment slot="header">{$t('learn.language-teach')}</svelte:fragment>
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
			<svelte:fragment slot="header">
				{$t('learn.topic')}
			</svelte:fragment>
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
		<Step>
			<svelte:fragment slot="header">Private?</svelte:fragment>
			<input
				class="checkbox"
				type="checkbox"
				name="isPrivate"
				bind:checked={$takeClassStore.selectedIsPrivate}
			/>
		</Step>
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
				$takeClassStore.selectedIsPrivate === undefined ||
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
					).toLocaleString($userStore?.preferedLanguage)} - {new Date(
						$takeClassStore.selectedEvent.event.end
					).toLocaleString($userStore?.preferedLanguage)}
				</p>
			{/if}
		</Step>
	</Stepper>
</div>
