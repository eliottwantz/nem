<script lang="ts">
	import Chatbox from '$lib/components/Chatbox/Chatbox.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/Teacher.svelte'
	import TakeClass from '$lib/components/TakeClass/TakeClass.svelte'
	import { Tab, TabGroup, getModalStore } from '@skeletonlabs/skeleton'

	export let data

	const modalStore = getModalStore()

	let tabSet: number = 0

	async function scheduleClass() {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: TakeClass,
				props: {
					teacher: data.teacher,
					classes: data.classes,
					availabilities: data.availabilities
				}
			}
		})
	}

	function openChat() {
		modalStore.trigger({
			type: 'component',
			component: {
				ref: Chatbox,
				props: {
					// roomId: data.teacher.id
				}
			}
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
						Schedule a class with this teacher
					</button>
					<button class="variant-ghost-surface btn" on:click={openChat}>
						Send a message
					</button>
				</div>
			</div>
		</div>

		<div>
			<TabGroup>
				<Tab bind:group={tabSet} name="Teaches" value={0}>Teaches</Tab>
				<Tab bind:group={tabSet} name="Bio" value={1}>Bio</Tab>
				<!-- Tab Panels --->
				<svelte:fragment slot="panel">
					{#if tabSet === 0}
						<div
							class="card flex flex-col gap-4 px-8 py-4 shadow-md ring-1 ring-surface-500"
						>
							{#if data.teacher.topAgent}
								<div class="flex items-center gap-2">
									<img class="h-10 w-10" src="/topagent.png" alt="TopAgent" />
									<p>
										This teacher is a NEM
										<span class="font-bold text-primary-600"> TopAgent </span>
									</p>
								</div>
							{/if}
							<div class="flex flex-col gap-2">
								{#each data.teacher.topicsTaught as topic}
									<p>{topic}</p>
								{/each}
							</div>
						</div>
					{:else if tabSet === 1}
						<div class="flex flex-col gap-8">
							<div
								class="card flex flex-col gap-4 px-8 py-4 shadow-md ring-2 ring-surface-500"
							>
								<p class="whitespace-pre-line">{data.teacher.bio}</p>
							</div>
						</div>
					{/if}
				</svelte:fragment>
			</TabGroup>
		</div>
	</div>
</Layout>
