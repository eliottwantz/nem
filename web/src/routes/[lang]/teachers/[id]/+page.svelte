<script lang="ts">
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import EmojiPicker from '$lib/components/EmojiPicker/EmojiPicker.svelte'
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
						availabilities: await data.streamed.availabilities
					}
				}
			})
		}
	}

	async function subscribe() {
		const res = await safeFetch(fetchers.subscriptionService(fetch).listSubscriptions())
		if (!res.ok) {
			toastStore.trigger({
				message: res.cause,
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
					subscriptions: res.data.subscriptions
				}
			}
		})
	}

	async function openChat() {
		const res = await safeFetch(
			fetchers.messageService(fetch, $page.data.session).findOneToOneConversation({
				user1Id: data.teacher.id,
				user2Id: $page.data.user.id
			})
		)
		let conversationId = undefined
		if (res.ok) conversationId = res.data.conversation.id
		drawerStore.open({
			id: drawerStoreIds.chat,
			meta: {
				conversationId,
				recepient: data.teacher
			},
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
						<span>Reviews</span>
						<span>{data.teacher.rating}</span>
					</div>
					<p>
						<span class="text-2xl font-semibold">{data.teacher.hourRate}$</span>
						<span>/hour</span>
					</p>
				</div>
				<div class="flex flex-col gap-2">
					{#if data.isFirstClass}
						<button class="variant-filled-primary btn" on:click={scheduleClass}>
							Schedule a trial class
						</button>
					{:else}
						<button class="variant-filled-primary btn" on:click={subscribe}>
							Subscribe
						</button>
						<button
							disabled={data.hoursBank === 0}
							class="variant-ghost-primary btn"
							on:click={scheduleClass}
						>
							Schedule a class
						</button>
					{/if}
					<button class="variant-ghost-surface btn" on:click={openChat}>
						Send a message
					</button>
				</div>
			</div>
		</div>

		{#if data.teacher.topAgent}
			<div class="flex items-center gap-2">
				<img class="h-10 w-10" src="/topagent.png" alt="TopAgent" />
				<p>
					This teacher is a NEM
					<a href="/top-agent" class="anchor font-bold text-primary-600">
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
								{#each data.teacher.topicsTaught as topic}
									<p>{topic}</p>
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
