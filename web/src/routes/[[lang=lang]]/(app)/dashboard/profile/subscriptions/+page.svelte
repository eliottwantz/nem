<script lang="ts">
	import Avatar from '$components/Avatar.svelte'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton'

	export let data
	console.log(data)
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-xl font-medium">Subscriptions</h3>
		<p class="text-muted-foreground text-sm">These are your currently active subscriptions.</p>
	</div>
	<hr class="separator my-6" />

	<div class="grid w-full grid-cols-3">
		<p>Name</p>
		<p>Subscription</p>
		<p>Next class</p>
	</div>
	<hr class="separator border-2" />
	<Accordion>
		{#each data.subscriptions as info}
			{@const sub = info.subscription}
			{@const teacher = info.teacher.profile}
			{@const classes = info.student.classes.filter((c) => c.teacherId === teacher.id)}
			<AccordionItem>
				<svelte:fragment slot="summary">
					<div class="grid w-full grid-cols-3 items-center">
						<a
							class="flex flex-col gap-2 hover:anchor sm:items-center"
							href={route('/teachers/[id]', {
								lang: langParams().lang,
								id: teacher.id
							})}
						>
							<Avatar
								width="w-10 sm:w-16"
								height="h-10 sm:h-16"
								src={teacher.avatarUrl ?? undefined}
								initials={getInitials(teacher)}
							/>
							<p class="font-semibold sm:text-lg">{getPublicName(teacher)}</p>
						</a>
						<div class=" flex flex-col gap-y-2">
							<p class="font-semibold">{sub?.name ?? 'Trial Class'}</p>
							<p>{sub?.hours} hours / month</p>
						</div>
						<div>
							{#if classes.length > 0}
								<p>
									{new Date(classes[0].timeSlot.startAt).toLocaleString(
										data.user.preferedLanguage
									)}
								</p>
							{/if}
						</div>
					</div>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<div>Upcoming classes</div>
					<div>
						{#each classes as upcoming}
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
