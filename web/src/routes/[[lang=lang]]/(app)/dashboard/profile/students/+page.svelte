<script lang="ts">
	import Avatar from '$components/Avatar.svelte'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton'

	export let data
	console.log(data)
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-xl font-medium">Students</h3>
		<p class="text-muted-foreground text-sm">
			These are all the students that have booked at least one class with you.
		</p>
	</div>
	<hr class="separator my-6" />

	<div class="grid w-full grid-cols-3">
		<p>Name</p>
		<p>Subscription</p>
		<p>Next class</p>
	</div>
	<hr class="separator border-2" />
	<Accordion>
		{#each data.studentsInfo as info}
			{@const sub = info.subscriptions.at(0)?.subscription}
			<AccordionItem>
				<svelte:fragment slot="summary">
					<div class="grid w-full grid-cols-3 items-center">
						<div class="flex items-center gap-x-2">
							<Avatar
								width="w-10 sm:w-16"
								height="h-10 sm:h-16"
								src={info.profile.avatarUrl ?? undefined}
								initials={getInitials(info.profile)}
							/>
							<p class="font-semibold sm:text-lg">{getPublicName(info.profile)}</p>
						</div>
						<div class="flex flex-col gap-y-2">
							<p class="font-semibold">{sub?.name ?? 'Trial Class'}</p>
							<p>{sub?.hours} hours / month</p>
						</div>
						<div>
							<p>
								{#if info.classes.length > 0}
									{new Date(info.classes[0].timeSlot.startAt).toLocaleString(
										data.user.preferedLanguage
									)}
								{:else}None scheduled{/if}
							</p>
						</div>
					</div>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<div>Upcoming classes</div>
					<div>
						{#each info.classes as upcoming}
							<p>
								{new Date(upcoming.timeSlot.startAt).toLocaleString(
									data.user.preferedLanguage
								)}
							</p>
						{/each}
					</div>
				</svelte:fragment>
			</AccordionItem>
		{/each}
	</Accordion>
</div>
