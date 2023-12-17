<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import LangSwitcher from '$components/LangSwitcher.svelte'
	import { langParams } from '$i18n'
	import { languageTag } from '$i18n/paraglide/runtime'
	import { route } from '$lib/ROUTES'
	import { safeFetch } from '$lib/api'
	import Avatar from '$lib/components/Avatar.svelte'
	import Countdown from '$lib/components/Countdown/Countdown.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import { derived } from 'svelte/store'

	export let data
	const start = new Date(data.class.timeSlot.startAt)
	const end = new Date(data.class.timeSlot.endAt)

	const modalStore = getModalStore()
	const toastStore = getToastStore()

	let currentTime = new Date()
	let canCancelClassWithRefund = false

	onMount(() => {
		const updateTime = setInterval(() => {
			currentTime = new Date()
		}, 1000)

		return () => {
			clearInterval(updateTime)
		}
	})

	$: lang = languageTag()
	$: {
		if (currentTime < new Date(start.getTime() - 2 * 60 * 60 * 1000)) {
			canCancelClassWithRefund = true
		} else {
			canCancelClassWithRefund = false
		}
	}

	// Only available if it's 10 minutes after the start time
	$: canSignalNotPresentTeacher = currentTime >= new Date(start.getTime() + 10 * 60 * 1000)

	$: console.log('canCancelClassWithRefund', canCancelClassWithRefund)
	$: console.log(new Date(start.getTime() - 2 * 60 * 60 * 1000).toLocaleString())

	async function joinClass() {
		modalStore.trigger({
			type: 'confirm',
			title: 'Join Class',
			body: 'Are you sure you want to join the class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return
				await goto(
					route('/dashboard/class/[id]', { id: data.class.id, lang: langParams().lang })
				)
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
					fetch(route('POST /api/classes/[id]/cancel', { id: data.class.id }), {
						method: 'POST'
					})
				)
				if (!res.ok) {
					toastStore.trigger({
						message: res.error.message,
						background: 'bg-red-500'
					})
					return
				}
				toastStore.trigger({
					message: 'Class cancelled',
					background: 'bg-success-500'
				})
				invalidateAll()
				goto(route('/dashboard/student/classes', langParams()))
			}
		})
	}
</script>

<Layout>
	<h1 slot="title">Topic: {data.class.topic} - Language: {data.class.language}</h1>
	<div class="flex flex-col gap-y-1">
		<p class="text-base sm:text-xl">Date: {start.toLocaleDateString(lang)}</p>
		<p class="text-base sm:text-xl">
			Time: {start.toLocaleTimeString(lang)} - {end.toLocaleTimeString(lang)}
		</p>
	</div>

	<br />

	{#if new Date() < new Date(end)}
		<div class="flex flex-col items-center gap-2 sm:flex-row">
			<button class="variant-filled-primary btn" title="Join Class" on:click={joinClass}>
				Join class
			</button>
			{#if canSignalNotPresentTeacher}
				<button class="variant-filled-primary btn" title="Teacher is not there">
					Teacher is not there
				</button>
			{/if}
			{#if !data.class.isTrial}
				<button
					on:click={cancelClass}
					title="Cancel class"
					class="variant-outline-error btn"
				>
					<DeleteIcon class="h-6 w-6" />
					{#if canCancelClassWithRefund}
						<span>Cancel class with hour refunded</span>
					{:else}
						<span>Cancel class</span>
					{/if}
				</button>
				{#if canCancelClassWithRefund}
					<Countdown
						timeountSec={(start.getTime() -
							2 * 60 * 60 * 1000 -
							currentTime.getTime()) /
							1000}
					/>
				{/if}
			{/if}
		</div>
	{:else}
		<p class="text-xl font-semibold">Class has ended</p>
	{/if}

	<br />

	<div class="card w-full max-w-xl space-y-4 p-4">
		<h3 class="h3 mb-2">Teacher</h3>
		<div class="flex gap-x-2">
			<a
				href={route('/teachers/[id]', {
					id: data.class.teacher.id,
					lang: langParams().lang
				})}
				class="relative flex items-center gap-2 p-2"
			>
				{#if data.class.teacher.topAgent}
					<span class="badge-icon absolute -left-2 -top-1 z-10 h-6 w-6">
						<img class="h-4 w-6" src="/topagent.png" alt="TopAgent" />
					</span>
				{/if}
				<Avatar
					width="w-8 sm:w-12"
					height="h-8 sm:h-12"
					src={data.class.teacher.profile.avatarUrl ?? undefined}
					initials={getInitials(data.class.teacher.profile)}
				/>
				<div>
					<p class="font-semibold sm:text-lg">
						{getPublicName(data.class.teacher.profile)}
					</p>
					{#if data.class.teacher.topAgent}
						<span class="font-bold text-primary-600"> TopAgent </span>
					{/if}
				</div>
			</a>
		</div>
		<h3 class="h3">Students</h3>
		<ul class="list grid grid-cols-2">
			{#each data.class.students as student}
				<li>
					<a
						class="flex items-center gap-2 p-2"
						href={route('/users/[id]', { id: student.id, lang: langParams().lang })}
					>
						<Avatar
							width="w-8 sm:w-12"
							height="h-8 sm:h-12"
							src={student.profile.avatarUrl ?? undefined}
							initials={getInitials(student.profile)}
						/>
						<p class="font-semibold sm:text-lg">
							{getPublicName(student.profile)}
						</p>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</Layout>
