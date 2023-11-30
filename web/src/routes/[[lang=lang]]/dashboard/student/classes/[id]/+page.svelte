<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import Avatar from '$lib/components/Avatar.svelte'
	import Countdown from '$lib/components/Countdown/Countdown.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte'
	import { getInitials, getPublicName } from '$lib/utils/initials'

	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { languageTag } from 'i18n/runtime'
	import { onMount } from 'svelte'

	export let data
	console.log(data.classDetails)

	const start = new Date(data.classDetails.class.startAt)
	const end = new Date(data.classDetails.class.endAt)
	$: locale = languageTag()

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
		if (currentTime < new Date(start.getTime() - 2 * 60 * 60 * 1000)) {
			showTimer = true
		} else {
			showTimer = false
		}
	}
	$: console.log('showTimer', showTimer)

	$: canSignalNotPresentTeacher = currentTime >= new Date(start.getTime() + 10 * 60 * 1000) // Only available if it's 10 minutes after the start time

	$: canCancelClassWithRefund = currentTime < new Date(start.getTime() - 2 * 60 * 60 * 1000)

	async function joinClass() {
		modalStore.trigger({
			type: 'confirm',
			title: 'Join Class',
			body: 'Are you sure you want to join the class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return
				await goto(`/dashboard/class/${data.classDetails.class.id}`)
			}
		})
	}

	async function cancelClass() {
		console.log('cancel class')
		modalStore.trigger({
			type: 'confirm',
			title: 'Cancel Class',
			body: 'Are you sure you want to cancel this class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return
				const res = await safeFetch(
					fetchers.studentService(fetch, $page.data.session).cancelClass({
						classId: data.classDetails.class.id
					})
				)
				if (!res.ok) {
					toastStore.trigger({
						message: res.cause,
						background: 'bg-red-500'
					})
					return
				}
				toastStore.trigger({
					message: 'Class cancelled with refund',
					background: 'bg-success-500'
				})
				window.location.replace('/dashboard/student/classes')
			}
		})
	}
</script>

<Layout>
	<h1 class="h1" slot="title">Class: {data.classDetails.class.name}</h1>
	<p>
		<span class="text-xl">{start.toLocaleDateString(locale)}</span>
		<span class="text-xl">
			{start.toLocaleTimeString(locale)} - {end.toLocaleTimeString(locale)}
		</span>
	</p>

	<br />

	{#if new Date() < new Date(end)}
		<div class="flex flex-col items-center gap-2 sm:flex-row">
			<button
				class="variant-filled-primary btn"
				title={data.classDetails.class.hasStarted
					? 'Join Class'
					: 'Wait for the teacher to start the class'}
				on:click={joinClass}>Join class</button
			>
			{#if canSignalNotPresentTeacher}
				<button class="variant-filled-primary btn" title="Teacher is not there">
					Teacher is not there
				</button>
			{/if}
			{#if !data.classDetails.class.isTrial}
				<button on:click={cancelClass} title="Cancel class" class="variant-ghost-error btn">
					<DeleteIcon class="h-6 w-6" />
					{#if canCancelClassWithRefund}
						<span>Cancel class with refund</span>
					{:else}
						<span>Cancel class</span>
					{/if}
					{#if showTimer}
						<Countdown
							timeountSec={(end.getTime() -
								2 * 60 * 60 * 1000 -
								currentTime.getTime()) /
								1000}
						/>
					{/if}
				</button>
			{/if}
		</div>
	{:else}
		<p class="text-xl font-semibold">Class has ended</p>
	{/if}

	<br />

	<div class="card w-full max-w-xl space-y-4 p-4">
		<h3 class="h3 mb-2">Teacher</h3>
		<div class="flex gap-x-2">
			<a href="teachers/{data.classDetails.teacher.id}" class="relative flex gap-2">
				{#if data.classDetails.teacher.topAgent}
					<span class="badge-icon absolute -left-2 -top-1 z-10 h-6 w-6">
						<img class="h-4 w-6" src="/topagent.png" alt="TopAgent" />
					</span>
				{/if}
				<Avatar
					width="w-8 sm:w-12"
					height="h-8 sm:h-12"
					src={data.classDetails.teacher.avatarUrl}
					initials={getInitials(
						data.classDetails.teacher.firstName,
						data.classDetails.teacher.lastName
					)}
				/>
				<div>
					<p class="font-semibold sm:text-lg">
						{getPublicName(
							data.classDetails.teacher.firstName,
							data.classDetails.teacher.lastName
						)}
					</p>
					{#if data.classDetails.teacher.topAgent}
						<span class="font-bold text-primary-600"> TopAgent </span>
					{/if}
				</div>
			</a>
		</div>
		<h3 class="h3">Students</h3>
		<ul class="list grid grid-cols-2">
			{#each data.classDetails.users as user}
				<li>
					<a class="flex items-center gap-2 p-2" href="users/{user.id}">
						<Avatar
							width="w-8 sm:w-12"
							height="h-8 sm:h-12"
							src={user.avatarUrl}
							initials={getInitials(user.firstName, user.lastName)}
						/>
						<p class="font-semibold sm:text-lg">
							{getPublicName(user.firstName, user.lastName)}
						</p>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</Layout>
