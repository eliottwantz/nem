<script lang="ts">
	import { goto } from '$app/navigation'
	import { langParams } from '$i18n'
	import { languageTag } from '$i18n/paraglide/runtime'
	import { route } from '$lib/ROUTES'
	import { safeFetch } from '$lib/api'
	import Avatar from '$lib/components/Avatar.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'

	export let data

	const start = new Date(data.class.timeSlot.startAt)
	const end = new Date(data.class.timeSlot.endAt)
	$: lang = languageTag()

	const modalStore = getModalStore()
	const toastStore = getToastStore()

	let canStartClass = false
	$: {
		const currentTime = new Date()
		const tenMinutesFromStart = new Date(start.getTime() + 10 * 60 * 1000)
		canStartClass = currentTime >= start && currentTime <= tenMinutesFromStart
	}
	let canCancelClass = false // Can only cancel a class ten minutes before start
	$: {
		const currentTime = new Date()
		const tenMinutesBeforeClass = new Date(start.getTime() - 10 * 60 * 1000)
		// canCancelClass = currentTime < tenMinutesBeforeClass
		canCancelClass = true
	}

	async function startClass() {
		// if (!canStartClass) {
		// 	console.log("Can't start class")
		// 	return
		// }
		modalStore.trigger({
			type: 'confirm',
			title: 'Start Class',
			body: 'Are you sure you want to start the class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return
				await goto(`/dashboard/class/${data.class.id}`)
			}
		})
	}

	async function cancelClass() {
		if (!canCancelClass) {
			console.log('Class has started')
			return
		}
		modalStore.trigger({
			type: 'confirm',
			title: 'Cancel Class',
			body: 'Are you sure you want to cancel this class?',
			response: async (confirmed: boolean) => {
				if (!confirmed) return
				const res = await safeFetch(
					fetch(
						route('DELETE /api/teacher/classes/[id]/cancel', {
							id: data.class.id
						}),
						{ method: 'DELETE' }
					)
				)
				if (!res.ok) {
					toastStore.trigger({
						message: res.error.message,
						background: 'bg-error-500'
					})
				} else {
					await goto(route('/dashboard/teacher/classes', langParams()))
					toastStore.trigger({
						message: 'Class cancelled',
						background: 'bg-success-500'
					})
				}
			}
		})
	}
</script>

<Layout>
	<h1 slot="title">
		{data.class.isTrial ? 'Trial' : ''} Class: {data.class.name}
	</h1>
	<p class="text-xl">
		<span>{start.toLocaleDateString(lang)}</span>
		{start.toLocaleTimeString(lang)} - {end.toLocaleTimeString(lang)}
	</p>

	<br />

	{#if new Date() < new Date(end)}
		<div class="flex gap-2">
			<button on:click={startClass} title="Start class" class="variant-filled-primary btn">
				<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
					><path d="M8 19V5l11 7l-11 7Z" /></svg
				>
				<span>Start class</span>
			</button>
			{#if !data.class.isTrial}
				<button
					on:click={cancelClass}
					disabled={!canCancelClass}
					title={canCancelClass
						? 'Cancel class'
						: 'You can only cancel a class 2 hour before start'}
					class="variant-filled-error btn"
				>
					<DeleteIcon class="h-6 w-6" />
					<span>Cancel class</span>
				</button>
			{/if}
		</div>
	{:else}
		<p class="text-xl font-semibold">Class has ended</p>
	{/if}

	<br />

	<div class="card w-full max-w-sm p-4">
		<h3 class="h3 mb-1">Students: {data.class.students.length}</h3>
		<ul class="list grid grid-cols-2">
			{#each data.class.students as user}
				<li>
					<a
						class="flex items-center gap-2 p-2"
						href={route('/users/[id]', { id: user.id, lang: langParams().lang })}
					>
						<Avatar
							width="w-8 sm:w-12"
							height="h-8 sm:h-12"
							src={user.profile.avatarUrl ?? undefined}
							initials={getInitials(user.profile)}
						/>
						<p class="font-semibold sm:text-lg">
							{getPublicName(user.profile)}
						</p>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</Layout>
