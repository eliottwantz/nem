<script lang="ts">
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import { drawerStoreIds } from '$lib/components/Drawer'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/TeacherProfile.svelte'
	import TakeTrialClass from '$lib/components/TakeTrialClass/TakeTrialClass.svelte'
	import { Tab, TabGroup, getDrawerStore, getModalStore } from '@skeletonlabs/skeleton'

	export let data

	const modalStore = getModalStore()
	const drawerStore = getDrawerStore()

	let tabSet: number = 0

	async function scheduleClass() {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: TakeTrialClass,
				props: {
					teacher: data.teacher,
					classes: data.classes,
					availabilities: data.availabilities
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
	<div class="flex w-full flex-col gap-8 p-10">
		<div class="flex flex-col items-center justify-around gap-4 md:flex-row">
			<Profile teacher={data.teacher} />
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-around text-lg">
					<div>
						<span>Reviews</span>
						<!-- <span>{data.teacher.reviews}</span> -->
					</div>
					<p>
						<span class="text-2xl font-semibold">{data.teacher.hourRate}$</span>
						<span>/hour</span>
					</p>
				</div>
				<div class="flex flex-col gap-2">
					<button class="variant-filled-primary btn" on:click={scheduleClass}>
						{#if data.isFirstClass}
							Schedule a trial class
						{:else}
							Schedule a class
						{/if}
					</button>
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
