<script lang="ts">
	import type { Teacher } from '$lib/api/api.gen'
	import { getInitials, getPublicName } from '$lib/utils/initials'

	import Avatar from '../Avatar.svelte'

	export let teacher: Teacher
	export let shortForm = false

	function badgeColor(proficiency: string): string {
		switch (proficiency) {
			case 'Native':
				return 'variant-filled-primary'
			case 'C2' || 'C1':
				return 'variant-filled-success'
			default:
				return 'variant-filled-surface'
		}
	}
</script>

{#if shortForm}
	<!-- Show only mobile -->
	<div class="card flex flex-col gap-y-4 p-2 shadow-md sm:p-4 md:hidden md:flex-row">
		<div class="flex items-center gap-3">
			<a href="teachers/{teacher.id}" class="relative inline-block">
				{#if teacher.topAgent}
					<span class="badge-icon absolute -top-0 left-1 z-10 h-6 w-6">
						<img class="h-4 w-6" src="/topagent.png" alt="TopAgent" />
					</span>
				{/if}
				<Avatar
					width="w-16 sm:w-28"
					height="h-16 sm:h-28"
					src={teacher.avatarUrl}
					initials={getInitials(teacher.firstName, teacher.lastName)}
				/>
			</a>
			<a href="teachers/{teacher.id}">
				<p class="font-semibold sm:text-lg">
					{getPublicName(teacher.firstName, teacher.lastName)}
				</p>
				{#if teacher.topAgent}
					<span class="font-bold text-primary-600"> TopAgent </span>
				{/if}
			</a>
			<div class="flex items-center justify-around gap-4 sm:text-lg">
				<div>
					<span>Reviews</span>
					{#if teacher.rating === 0}
						<span>N/A</span>
					{:else}
						<span>{teacher.rating}</span>
					{/if}
				</div>
				<p>
					<span class="font-semibold sm:text-2xl">{teacher.hourRate}$</span>
					<span>/hour</span>
				</p>
			</div>
		</div>
		<div class="flex items-baseline">
			<span class="pr-2 font-semibold">Speaks</span>
			<div class="flex flex-wrap gap-2">
				{#each teacher.spokenLanguages as spokenL}
					<div>
						<span>{spokenL.language}</span>
						<span class="{badgeColor(spokenL.proficiency)} badge"
							>{spokenL.proficiency}</span
						>
					</div>
				{/each}
			</div>
		</div>
		<div class="flex items-baseline">
			<span class="pr-2 font-semibold">Teaches</span>
			<div class="flex flex-wrap gap-2">
				{#each teacher.topicsTaught as topic}
					<div>
						<span>{topic}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="flex items-baseline">
			<span class="pr-2 font-semibold">Bio</span>
			<p class="line-clamp-3 whitespace-pre-line">{teacher.bio}</p>
		</div>
	</div>

	<!-- Show for tablet and laptops -->
	<div class="card hidden flex-row gap-4 p-4 shadow-md md:flex">
		<div class="flex flex-col items-center">
			<a href="teachers/{teacher.id}" class="relative">
				{#if teacher.topAgent}
					<span class="badge-icon absolute -top-0 left-2 z-10 h-8 w-8">
						<img class="h-6 w-8" src="/topagent.png" alt="TopAgent" />
					</span>
				{/if}
				<Avatar
					width="w-16 sm:w-28"
					height="h-16 sm:h-28"
					src={teacher.avatarUrl}
					initials={getInitials(teacher.firstName, teacher.lastName)}
				/>
			</a>
			<a href="teachers/{teacher.id}" class="flex flex-col items-center">
				<p class="font-semibold sm:text-lg">
					{getPublicName(teacher.firstName, teacher.lastName)}
				</p>
				{#if teacher.topAgent}
					<span class="font-bold text-primary-600"> TopAgent </span>
				{/if}
			</a>
			<div class="flex flex-col items-center justify-around sm:text-lg">
				<div>
					<span>Reviews</span>
					{#if teacher.rating === 0}
						<span>N/A</span>
					{:else}
						<span>{teacher.rating}</span>
					{/if}
				</div>
				<p>
					<span class="font-semibold sm:text-2xl">{teacher.hourRate}$</span>
					<span>/hour</span>
				</p>
			</div>
		</div>
		<div class="flex w-full flex-col">
			<div class="grid flex-1 grid-cols-3">
				<div>
					<span class="pr-2 font-semibold">Speaks</span>
					<div class="flex flex-wrap gap-2">
						{#each teacher.spokenLanguages as spokenL}
							<div>
								<span>{spokenL.language}</span>
								<span class="{badgeColor(spokenL.proficiency)} badge"
									>{spokenL.proficiency}</span
								>
							</div>
						{/each}
					</div>
				</div>
				<div>
					<span class="pr-2 font-semibold">Teaches</span>
					<div class="flex flex-wrap gap-2">
						{#each teacher.topicsTaught as topic}
							<div>
								<span>{topic}</span>
							</div>
						{/each}
					</div>
				</div>
				<div>
					<span class="pr-2 font-semibold">Bio</span>
					<p class="line-clamp-5 whitespace-pre-line">{teacher.bio}</p>
				</div>
			</div>
			<div class="self-end">
				<a href="teachers/{teacher.id}" class="variant-filled-primary btn">Show more</a>
			</div>
		</div>
	</div>
{:else}
	<div class="md:flex-row">
		<div class="flex items-center gap-3">
			<Avatar
				width="w-28"
				height="h-28"
				src={teacher.avatarUrl}
				initials={getInitials(teacher.firstName, teacher.lastName)}
			/>
			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<p class="text-2xl font-semibold">
						{getPublicName(teacher.firstName, teacher.lastName)}
					</p>
					{#if teacher.topAgent}
						<img class="h-5 w-5" src="/topagent.png" alt="TopAgent" />
					{/if}
				</div>
				<div class=" flex flex-wrap gap-2">
					{#each teacher.spokenLanguages as spokenL}
						<div>
							<span>{spokenL.language}</span>
							<span class="{badgeColor(spokenL.proficiency)} badge"
								>{spokenL.proficiency}</span
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
