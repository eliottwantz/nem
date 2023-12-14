<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { safeFetch } from '$lib/api'
	import { drawerStoreIds, type DrawerMetaChat } from '$lib/components/Drawer'
	import Layout from '$lib/components/Layout.svelte'
	import TeacherProfile from '$lib/components/Profile/TeacherProfile.svelte'
	import Subscription from '$lib/components/Subscription/Subscription.svelte'
	import TakeClass from '$lib/components/TakeClass/TakeClass.svelte'
	import {
		Tab,
		TabGroup,
		getDrawerStore,
		getModalStore,
		getToastStore
	} from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'

	export let data
	console.log('data from teacher/id', data)

	const modalStore = getModalStore()
	const drawerStore = getDrawerStore()
	const toastStore = getToastStore()
	let tabSet: number = 0

	onMount(() => {
		if ($page.url.searchParams.get('take-trial-class') === 'cancel') {
			toastStore.trigger({
				message: 'Payment cancelled',
				background: 'bg-error-500'
			})
		}
		if ($page.url.searchParams.get('take-trial-class') === 'success') {
			toastStore.trigger({
				message: 'Payment successful',
				background: 'bg-success-500'
			})
		}
		if ($page.url.searchParams.get('subscribe') === 'cancel') {
			toastStore.trigger({
				message: 'Subscription canceled',
				background: 'bg-error-500'
			})
		}
		if ($page.url.searchParams.get('subscribe') === 'success') {
			toastStore.trigger({
				message: 'Subscription successful',
				background: 'bg-success-500'
			})
		}
	})

	async function scheduleClass() {
		if (data.isFirstClass) {
			modalStore.trigger({
				type: 'component',
				component: {
					ref: TakeClass,
					props: {
						teacher: data.teacher,
						classes: await data.streamed.classes,
						availabilities: await data.streamed.availabilities,
						isTrial: true
					}
				}
			})
		} else {
			modalStore.trigger({
				type: 'component',
				component: {
					ref: TakeClass,
					props: {
						teacher: data.teacher,
						classes: await data.streamed.classes,
						availabilities: await data.streamed.availabilities,
						isTrial: false
					}
				}
			})
		}
	}

	async function subscribe() {
		const subs = await data.streamed.subscriptions
		if (!subs.length) {
			toastStore.trigger({
				message: 'Failed to retreive subscriptions',
				background: 'bg-error-500'
			})
			return
		}
		modalStore.trigger({
			type: 'component',
			component: {
				ref: Subscription,
				props: {
					teacher: data.teacher,
					subscriptions: subs
				}
			}
		})
	}

	async function endSub() {
		modalStore.trigger({
			type: 'confirm',
			title: 'End Subscription',
			body: 'Are you sure you want to end your subscription?',
			response: async (r: boolean) => {
				const res = await safeFetch(
					fetch(
						route('POST /teachers/[id]/unsubscribe', {
							lang: langParams().lang,
							id: $page.params.id
						}),
						{
							method: 'POST'
						}
					)
				)
				if (!res.ok) {
					toastStore.trigger({
						message: res.error.message,
						background: 'bg-error-500'
					})
					return
				}
				toastStore.trigger({
					message: 'Subscription ended',
					background: 'bg-success-500'
				})
				invalidateAll()
				await goto($page.url.pathname)
			}
		})
	}

	async function openChat() {
		const chat = await data.streamed.chat
		if (chat instanceof Error) {
			toastStore.trigger({
				message: 'Error occurred while trying to open chat. Please try again later',
				background: 'bg-error-500'
			})
			return
		}
		drawerStore.open({
			id: drawerStoreIds.chat,
			meta: {
				chatId: chat?.id,
				recepient: data.teacher.profile
			} satisfies DrawerMetaChat,
			position: 'right',
			width: 'w-2/3'
		})
	}
</script>

<Layout>
	<div class="flex w-full flex-col gap-8 p-10 pt-0">
		<div class="flex flex-col items-center justify-around gap-4 md:flex-row">
			<TeacherProfile teacher={data.teacher} />
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-around gap-x-2 text-lg">
					<div>
						{#if data.teacher.rating === 0}
							<span>No reviews</span>
						{:else}
							<div class="flex items-center gap-x-1">
								<img class="h-6 w-6" src="/star.svg" alt="star" />
								<p class="text-2xl font-semibold">{data.teacher.rating}</p>
							</div>
							<span>{data.teacher.reviews.length} reviews</span>
						{/if}
					</div>
					<p>
						<span class="text-2xl font-semibold">{data.teacher.hourRate}$</span>
						<span>/hour</span>
					</p>
				</div>
				{#if data.user.id !== data.teacher.id}
					<div class="flex flex-col gap-2">
						{#if data.isFirstClass}
							<button class="variant-filled-primary btn" on:click={scheduleClass}>
								Schedule a trial class
							</button>
						{:else if data.subscription}
							<button
								disabled={data.hoursBank === 0}
								class="variant-filled-primary btn"
								on:click={scheduleClass}
							>
								Schedule a class
							</button>
							<button class="variant-ghost-primary btn" on:click={endSub}>
								End subscription
							</button>
						{:else}
							<button class="variant-filled-primary btn" on:click={subscribe}>
								Subscribe
							</button>
						{/if}
						<button class="variant-ghost-surface btn" on:click={openChat}>
							Send a message
						</button>
					</div>
				{/if}
			</div>
		</div>

		{#if data.teacher.topAgent}
			<div class="flex items-center gap-2">
				<img class="h-10 w-10" src="/topagent.png" alt="TopAgent" />
				<p>
					This teacher is a NEM
					<a
						href={route('/top-agent', langParams())}
						class="anchor font-bold text-primary-600"
					>
						<span> TopAgent </span>
					</a>
				</p>
			</div>
		{/if}

		<div>
			<TabGroup>
				<Tab bind:group={tabSet} name="Teaches" value={0}>Teaches</Tab>
				<Tab bind:group={tabSet} name="Bio" value={1}>Bio</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					<div
						class="card flex flex-col gap-4 px-8 py-4 shadow-md ring-2 ring-surface-500"
					>
						{#if tabSet === 0}
							<div class="flex flex-col gap-2">
								{#each data.teacher.topics as topic}
									<p>{topic.topic}</p>
								{/each}
							</div>
						{:else if tabSet === 1}
							<p class="whitespace-pre-line">{data.teacher.bio}</p>
						{/if}
					</div>
				</svelte:fragment>
			</TabGroup>
		</div>
	</div>
</Layout>
