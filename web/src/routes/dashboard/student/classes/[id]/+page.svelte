<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import Avatar from '$lib/components/Avatar.svelte'
	import Countdown from '$lib/components/Countdown/Countdown.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte'
	import { getInitials } from '$lib/utils/initials'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import { locale } from 'svelte-i18n'
	import { tweened, type Tweened } from 'svelte/motion'

	export let data

	const start = new Date(data.classDetails.class.startAt)
	const end = new Date(data.classDetails.class.endAt)
	$: _locale = $locale ?? 'en'

	const modalStore = getModalStore()
	const toastStore = getToastStore()

	let currentTime = new Date()
	let showTimer = false

	onMount(() => {
		const updateTime = setInterval(() => {
			currentTime = new Date()
		}, 1000)

		return () => {
			clearInterval(updateTime)
		}
	})

	$: {
		if (
			currentTime >= new Date(start.getTime() - 5 * 60 * 60 * 1000) &&
			currentTime < new Date(start.getTime() - 4 * 60 * 60 * 1000)
		) {
			showTimer = true
		} else {
			showTimer = false
		}
	}
	$: console.log('showTimer', showTimer)

	// let remainingTime = 0
	// $: console.log('remainingTime', remainingTime)
	// $: {
	// 	console.log('evaluating')
	// 	const sixHoursBeforeClass = new Date(start.getTime() - 6 * 60 * 60 * 1000)
	// 	console.log('sixHoursBeforeClass', sixHoursBeforeClass)
	// 	const fourHoursBeforeClass = new Date(start.getTime() - 4 * 60 * 60 * 1000)
	// 	console.log('fourHoursBeforeClass', fourHoursBeforeClass)
	// 	console.log('currentTime', currentTime)

	// 	if (currentTime >= sixHoursBeforeClass && currentTime < fourHoursBeforeClass) {
	// 		remainingTime = fourHoursBeforeClass.getTime() - currentTime.getTime()
	// 	} else {
	// 		remainingTime = 0
	// 	}
	// }

	// function formatTime(ms: number) {
	// 	const totalSeconds = Math.floor(ms / 1000)
	// 	const hours = Math.floor(totalSeconds / 3600)
	// 	const minutes = Math.floor((totalSeconds % 3600) / 60)
	// 	const seconds = Math.floor(totalSeconds % 60)

	// 	return `${hours} hours, ${minutes} minutes, ${seconds} seconds`
	// }

	$: canSignalNotPresentTeacher = currentTime >= new Date(start.getTime() + 10 * 60 * 1000) // Only available if it's 10 minutes after the start time

	$: canCancelClassWithRefund = currentTime < new Date(start.getTime() - 4 * 60 * 60 * 1000) // Can only cancel a class for free four hours before start

	async function joinClass() {
		modalStore.trigger({
			type: 'confirm',
			title: 'Join Class',
			body: 'Are you sure you want to join the class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return

				const session = $page.data.session
				if (!session) return

				const res = await safeFetch(
					fetchers.studentService(fetch, session).joinClass({
						classId: data.classDetails.class.id
					})
				)
				if (!res.ok) {
					toastStore.trigger({
						message: res.cause,
						background: 'variant-filled-error'
					})
					return
				}

				await goto(`/class/${data.classDetails.class.id}`)
			}
		})
	}

	async function cancelClass() {
		// if (!canCancelClass) {
		// 	console.log('Class has started')
		// 	return
		// }
		console.log('cancel class')
		return
		modalStore.trigger({
			type: 'confirm',
			title: 'Cancel Class',
			body: 'Are you sure you want to cancel this class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return
				try {
					await fetch('/dashboard/teacher/classes/', {
						method: 'DELETE',
						body: JSON.stringify(data.classDetails.class)
					})
					window.location.reload()
				} catch (error) {
					toastStore.trigger({
						message: error instanceof Error ? error.message : 'An error occured',
						background: 'variant-filled-error'
					})
				}
			}
		})
	}
</script>

<Layout>
	<h1 class="h1" slot="title">Class: {data.classDetails.class.name}</h1>
	<p class="text-xl">
		<span>{start.toLocaleDateString(_locale)}</span>
		{start.toLocaleTimeString(_locale)} - {end.toLocaleTimeString(_locale)}
		<span></span>
	</p>

	<br />

	{#if new Date() < new Date(end)}
		<div class="flex gap-2">
			<button
				class="variant-filled-primary btn"
				disabled={!data.classDetails.class.hasStarted}
				title={data.classDetails.class.hasStarted
					? 'Join Class'
					: 'Wait for the teacher to start the class'}
				on:click={joinClass}>Join class</button
			>
			{#if canSignalNotPresentTeacher}
				<button class="variant-filled-primary btn" title="Teacher is not there"
					>Teacher is not there</button
				>
			{/if}
			{#if showTimer}
				<Countdown timeountSec={60 * 60 * 1} />
			{/if}
			<button on:click={cancelClass} title="Cancel class" class="variant-filled-error btn">
				<DeleteIcon class="h-6 w-6" />
				{#if canCancelClassWithRefund}
					<span>Cancel class with refund</span>
				{:else}
					<span>Cancel class</span>
				{/if}
			</button>
		</div>
	{:else}
		<p class="text-xl font-semibold">Class has ended</p>
	{/if}

	<div class="card w-full max-w-lg space-y-4 p-4">
		<h3 class="h3 mb-2">Teacher</h3>
		<a href="/dashboard/users/{data.classDetails.teacher.id}">
			<li class="flex items-center gap-2 p-2 rounded-token hover:bg-primary-300">
				<Avatar
					src={data.classDetails.teacher.avatarUrl}
					initials={getInitials(
						data.classDetails.teacher.firstName,
						data.classDetails.teacher.lastName
					)}
				/>
				<span class="flex-auto"
					>{data.classDetails.teacher.firstName +
						' ' +
						data.classDetails.teacher.lastName}</span
				>
			</li>
		</a>
		<h3 class="h3">Students</h3>
		{#each data.classDetails.users as user}
			<ul class="list space-y-4">
				<a href="/users/{user.id}">
					<li class="flex items-center gap-2 p-2 hover:bg-primary-300">
						<Avatar
							src={user.avatarUrl}
							initials={getInitials(user.firstName, user.lastName)}
						/>
						<span class="flex-auto">{user.firstName + ' ' + user.lastName}</span>
					</li>
				</a>
			</ul>
		{/each}
	</div>
</Layout>
