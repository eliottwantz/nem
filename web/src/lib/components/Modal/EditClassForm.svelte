<!-- <script lang="ts">
	import { fetchers, safeFetch } from '$lib/api'
	import type { Learn } from '$lib/api/api.gen'
	import { validator } from '@felte/validator-zod'
	import { modalStore } from '@skeletonlabs/skeleton'
	import { createForm } from 'felte'
	import { onMount } from 'svelte'
	import { z } from 'zod'

	let errMsg = ''
	let learns: Learn[] = []

	onMount(async () => {
		await fetchLearns()
	})

	async function fetchLearns() {
		const res = await safeFetch(fetchers.classService.listAvailableLearns())
		if (!res.ok) {
			errMsg = res.cause
			return
		}

		learns = res.data.learns
	}

	const schema = z.object({
		name: z.string().nonempty({ message: 'Class name is required' }),
		userIDs: z.array(z.string().nonempty({ message: 'User ID is required' })),
		learnId: z.string().nonempty({ message: 'Learn ID is required' }),
		startAt: z.string().nonempty({ message: 'Start time is required' }),
		endAt: z.string().nonempty({ message: 'End time is required' })
	})

	const { form, errors, data } = createForm<z.infer<typeof schema>>({
		extend: validator({ schema }),
		onSubmit: async () => {
			const res = await safeFetch(
				fetchers.adminService.adminCreateClass({
					req: {
						name: $data.name,
						learnId: parseInt($data.learnId),
						end_at: $data.endAt,
						start_at: $data.startAt,
						userIDs: []
					}
				})
			)
			if (!res.ok) {
				console.log(res.error)
				errMsg = res.cause
				return
			}

			errMsg = ''
			modalStore.close()
		}
	})
</script>

<form use:form class="space-y-4">
	<div class="space-y-2">
		<label class="label">
			<span>Class Name</span>
			<input class="input" type="text" name="name" />
		</label>
		{#if $errors.name}
			<span class="text-error-500">{$errors.name}</span>
		{/if}
		<label class="label">
			<span>Learn ID</span>
			<select class="select" name="learnId">
				{#each learns as learn}
					<option value={learn.id}>
						{learn.language} - {learn.topic}
					</option>
				{/each}
			</select>
		</label>
		{#if $errors.learnId}
			<span class="text-error-500">{$errors.learnId}</span>
		{/if}
		<label>
			<span>Start at</span>
			<input class="input" type="datetime-local" name="startAt" />
		</label>
		{#if $errors.startAt}
			<span class="text-error-500">{$errors.startAt}</span>
		{/if}
		<label>
			<span>End at</span>
			<input class="input" type="datetime-local" name="endAt" />
		</label>
		{#if $errors.endAt}
			<span class="text-error-500">{$errors.endAt}</span>
		{/if}
	</div>

	<button class="btn bg-primary-active-token"> Add class </button>
	<p class="text-error-500">{errMsg}</p>
</form> -->
