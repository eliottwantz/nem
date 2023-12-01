<script lang="ts">
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import type {
		Proficiency,
		Profile,
		Review,
		SpokenLanguage,
		Teacher,
		Topic
	} from '@prisma/client'
	import Avatar from '../Avatar.svelte'
	import Link from '$components/Link.svelte'

	export let teacher: Teacher & {
		profile: Profile
		spokenLanguages: SpokenLanguage[]
		topics: Topic[]
		reviews: Review[]
	}
	export let shortForm = false

	function badgeColor(proficiency: Proficiency): string {
		switch (proficiency) {
			case 'native':
				return 'variant-filled-primary'
			case 'c2' || 'c1':
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
			<Link href="/teachers/{teacher.id}" class="relative inline-block">
				{#if teacher.topAgent}
					<span class="badge-icon absolute -top-0 left-1 z-10 h-6 w-6">
						<img class="h-4 w-6" src="/topagent.png" alt="TopAgent" />
					</span>
				{/if}
				<Avatar
					width="w-16 sm:w-28"
					height="h-16 sm:h-28"
					src={teacher.profile.avatarUrl ?? undefined}
					initials={getInitials(teacher.profile)}
				/>
			</Link>
			<Link href="/teachers/{teacher.id}">
				<p class="font-semibold sm:text-lg">
					{getPublicName(teacher.profile)}
				</p>
				{#if teacher.topAgent}
					<span class="font-bold text-primary-600"> TopAgent </span>
				{/if}
			</Link>
			<div class="flex items-center justify-around gap-4 sm:text-lg">
				<div>
					{#if teacher.rating === 0}
						<span>No reviews</span>
					{:else}
						<div class="flex gap-x-1">
							<img class="h-5 w-5" src="/star.svg" alt="star" />
							<span>{teacher.rating}</span>
						</div>
						<span>{teacher.reviews.length} reviews</span>
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
						<span>{spokenL.languageId}</span>
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
				{#each teacher.topics as topic}
					<div>
						<span>{topic.topic}</span>
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
			<Link href="/teachers/{teacher.id}" class="relative">
				{#if teacher.topAgent}
					<span class="badge-icon absolute -top-0 left-2 z-10 h-8 w-8">
						<img class="h-6 w-8" src="/topagent.png" alt="TopAgent" />
					</span>
				{/if}
				<Avatar
					width="w-16 sm:w-28"
					height="h-16 sm:h-28"
					src={teacher.profile.avatarUrl ?? undefined}
					initials={getInitials(teacher.profile)}
				/>
			</Link>
			<Link href="/teachers/{teacher.id}" class="flex flex-col items-center">
				<p class="font-semibold sm:text-lg">
					{getPublicName(teacher.profile)}
				</p>
				{#if teacher.topAgent}
					<span class="font-bold text-primary-600"> TopAgent </span>
				{/if}
			</Link>
			<div class="flex flex-col items-center justify-around sm:text-lg">
				<div>
					{#if teacher.rating === 0}
						<span>No reviews</span>
					{:else}
						<div class="flex gap-x-1">
							<img class="h-5 w-5" src="/star.svg" alt="star" />
							<span>{teacher.rating}</span>
						</div>
						<span>{teacher.reviews.length} reviews</span>
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
								<span>{spokenL.languageId}</span>
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
						{#each teacher.topics as topic}
							<div>
								<span>{topic.topic}</span>
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
				<Link href="/teachers/{teacher.id}" class="variant-filled-primary btn"
					>Show more</Link
				>
			</div>
		</div>
	</div>
{:else}
	<div class="md:flex-row">
		<div class="flex items-center gap-3">
			<Avatar
				width="w-28"
				height="h-28"
				src={teacher.profile.avatarUrl ?? undefined}
				initials={getInitials(teacher.profile)}
			/>
			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<p class="text-2xl font-semibold">
						{getPublicName(teacher.profile)}
					</p>
					{#if teacher.topAgent}
						<img class="h-5 w-5" src="/topagent.png" alt="TopAgent" />
					{/if}
				</div>
				<div class=" flex flex-wrap gap-2">
					{#each teacher.spokenLanguages as spokenL}
						<div>
							<span>{spokenL.languageId}</span>
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
