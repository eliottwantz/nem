<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import { modalComponentRegistry } from '$lib/components/Modal'
	import Profile from '$lib/components/Profile/Teacher.svelte'
	import { getModalStore } from '@skeletonlabs/skeleton'

	export let data
	console.log('DATA', data)

	const modalStore = getModalStore()

	async function scheduleClass() {
		modalStore.trigger({
			type: 'component',
			component: modalComponentRegistry.takeClass
		})
	}
</script>

<Layout>
	<div class="flex flex-col gap-8 p-10">
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
					<button class="variant-ghost-surface btn"> Send a message </button>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-8 md:grid md:grid-cols-2">
			<div class="flex flex-col gap-8">
				<div class="card flex flex-col gap-4 px-8 py-4 shadow-md ring-1 ring-surface-500">
					{#if data.teacher.topAgent}
						<div class="flex items-center gap-2">
							<img class="h-10 w-10" src="/topagent.png" alt="TopAgent" />
							<p>
								This teacher is a NEM
								<span class="font-bold text-primary-600"> TopAgent </span>
							</p>
						</div>
					{/if}
					<div>
						<h4 class="h4 mb-2 font-semibold">Teaches</h4>
						<div class="flex flex-col gap-2">
							{#each Array.from(new Set(data.teacher.topicsTaught.map((t) => t.language))) as teachingLang}
								{#each data.teacher.topicsTaught.filter((t) => t.language === teachingLang) as topic}
									<p>{topic.topic} in {topic.language}</p>
								{/each}
							{/each}
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-8">
				<div class="card flex flex-col gap-4 px-8 py-4 shadow-md ring-2 ring-surface-500">
					<h4 class="h4 font-semibold">Bio</h4>
					<p>{data.teacher.bio}</p>
				</div>
			</div>
		</div>
	</div>
</Layout>
