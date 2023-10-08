<script lang="ts">
	import { goto, invalidate, invalidateAll, preloadData } from '$app/navigation'
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import type { Learn, TimeSlot, User } from '$lib/api/api.gen'
	import { userStore } from '$lib/stores/user'
	import { getInitials } from '$lib/utils/initials'
	import {
		ListBox,
		ListBoxItem,
		Step,
		Stepper,
		getModalStore,
		getToastStore
	} from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import Avatar from './Avatar.svelte'
	import {
		availabilityToCalendarEntryOneHourBlock,
		type CalendarEvent,
		type CalendarInteractEvent
	} from './Calendar'
	import Calendar from './Calendar/Calendar.svelte'

	export let languages: string[]
	export let learns: Learn[]
	export let initialTeacher: User | undefined = undefined

	const toastStore = getToastStore()
	const modalStore = getModalStore()

	let selectedLanguage: string
	let selectedTopic: string
	let selectedIsPrivate: boolean = false
	let selectedTeacher: User | undefined = initialTeacher
	let selectedEvent: CalendarInteractEvent | undefined

	$: lockedLanguage = !selectedLanguage
	$: lockedTopic = !selectedTopic
	$: lockedTeacher = !selectedTeacher
	$: lockedEvent = !selectedEvent
	$: console.log('selectedLanguage', selectedLanguage)
	$: console.log('selectedTopic', selectedTopic)
	$: console.log('selectedIsPrivate', selectedIsPrivate)
	$: console.log('selectedTeacher', selectedTeacher)
	$: console.log('selectedTimeSlot', selectedEvent)
	$: topics = learns
		.filter((learn) => {
			if (!selectedLanguage) return true
			return learn.language === selectedLanguage
		})
		.map((learn) => learn.topic)
	let teachers: User[] = []
	$: console.log('teachers', teachers)
	let timeSlots: TimeSlot[] = []
	$: console.log('availabilities', timeSlots)
	$: events = timeSlots
		.map((a) => availabilityToCalendarEntryOneHourBlock(a))
		.reduce((a, b) => [...a, ...b], [] as CalendarEvent[])
	$: console.log('events', events)

	async function fetchTeachers() {
		if (!$page.data.session) return
		const res = await safeFetch(
			fetchers
				.classService(fetch, $page.data.session)
				.listTeachersForLearn({ lang: selectedLanguage, topic: selectedTopic })
		)
		if (!res.ok) {
			toastStore.trigger({
				message: res.cause,
				background: 'bg-error-500'
			})
			return
		}

		teachers = res.data.teachers
		return res.data.teachers
	}

	async function fetchTeacherAvailabilities() {
		if (!$page.data.session) return
		const res = await safeFetch(
			fetchers
				.classService(fetch, $page.data.session)
				.listTeacherAvailabilities({ teacherId: selectedTeacher!.id })
		)
		if (!res.ok) {
			toastStore.trigger({
				message: res.cause,
				background: 'bg-error-500'
			})
			return
		}

		timeSlots = res.data.timeSlots
		return res.data.timeSlots
	}

	async function selectClass(cal: any, info: CalendarInteractEvent) {
		console.log('Time slot selected for class', info)
		modalStore.trigger({
			type: 'confirm',
			title: 'Select time slot',
			body: 'Are you sure you want to select this time slot?',
			response: (confirmed: boolean) => {
				if (!confirmed) {
					if (selectedEvent) {
						const event: CalendarEvent = {
							...selectedEvent.event,
							backgroundColor: '#fbdc90'
						}
						cal.updateEvent(event)
					}
					selectedEvent = undefined
				} else {
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
			}
		})
	}

	async function orderLearn() {
		if (
			!selectedLanguage ||
			!selectedTopic ||
			!selectedTeacher ||
			selectedIsPrivate === undefined ||
			!selectedEvent
		)
			return

		if (!$page.data.session) return
		const res = await safeFetch(
			fetchers.classService(fetch, $page.data.session).createOrJoinClass({
				req: {
					isPrivate: selectedIsPrivate,
					learnId: learns.find(
						(l) => l.language === selectedLanguage && l.topic === selectedTopic
					)!.id,
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
	}

	// async function removeTeacherFilter() {
	// 	preloadData('/dashboard/student/learn')
	// 	await goto('/dashboard/student/learn')
	// }
</script>

<div class="card text-token mt-2 w-full p-4">
	{#if initialTeacher}
		<div
			class="mx-auto flex w-max flex-col items-center justify-center gap-2 rounded-lg bg-surface-400 px-4 py-2"
		>
			<p class="text-xl">Selected teacher</p>
			<div class="flex items-center gap-2">
				<Avatar
					src={initialTeacher.avatarUrl}
					initials={getInitials(initialTeacher.firstName, initialTeacher.lastName)}
				/>
				<span>{initialTeacher.firstName + ' ' + initialTeacher.lastName}</span>
				<a href="/dashboard/student/learn" class="variant-filled-error btn-icon h-5 w-5">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="1em"
						height="1em"
						viewBox="0 0 24 24"
						><path
							fill="none"
							stroke="#000"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M18 6L6 18M6 6l12 12"
						/></svg
					>
				</a>
			</div>
		</div>
	{/if}
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
				{#each languages as language}
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
		{#if !initialTeacher}
			<Step locked={lockedTeacher}>
				<svelte:fragment slot="header">Teachers</svelte:fragment>
				<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
					{#await fetchTeachers()}
						<p>Fetching teachers for that can teach you</p>
					{:then teachers}
						{#if teachers}
							{#each teachers as t}
								<ListBoxItem bind:group={selectedTeacher} name="teacher" value={t}>
									<div class="flex items-center gap-2">
										<Avatar
											src={t.avatarUrl}
											initials={getInitials(t.firstName, t.lastName)}
										/>
										<span>{t.firstName + ' ' + t.lastName}</span>
									</div>
								</ListBoxItem>
							{/each}
						{:else}
							<p>No teachers available</p>
						{/if}
					{/await}
				</ListBox>
			</Step>
		{/if}

		<Step locked={lockedEvent}>
			<svelte:fragment slot="header">Time slots</svelte:fragment>
			{#await fetchTeacherAvailabilities()}
				<p>Fetching teacher's calendar availablities</p>
			{:then availabilities}
				{#if availabilities && availabilities.length > 0}
					<Calendar calendarMode="selectCourse" {events} eventClick={selectClass} />
				{:else}
					<p>No availabilities available for this teacher</p>
				{/if}
			{/await}
		</Step>
		<Step
			locked={!selectedLanguage ||
				!selectedTopic ||
				!selectedTeacher ||
				selectedIsPrivate === undefined ||
				!selectedEvent}
		>
			<svelte:fragment slot="header">Summary</svelte:fragment>

			<p>Selected language: {selectedLanguage}</p>
			<p>Selected topic: {selectedTopic}</p>
			<p>Private class: {selectedIsPrivate ? 'Yes' : 'No'}</p>
			<p>Selected teacher: {selectedTeacher?.firstName + ' ' + selectedTeacher?.lastName}</p>
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
