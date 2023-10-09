<script lang="ts">
	import type { Teacher } from '$lib/api/api.gen'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import Avatar from '../Avatar.svelte'

	export let teacher: Teacher

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

<div class="flex gap-3">
	<Avatar
		width="w-28"
		height="h-28"
		src={teacher.avatarUrl}
		initials={getInitials(teacher.firstName, teacher.lastName)}
	/>
	<div class="flex flex-col justify-evenly">
		<div class="flex items-center gap-2">
			<p class=" text-lg font-semibold">
				{getPublicName(teacher.firstName, teacher.lastName)}
			</p>
			{#if teacher.topAgent}
				<img class="h-5 w-5" src="/topagent.png" alt="TopAgent" />
			{/if}
		</div>
		<div class="flex">
			<span class="pr-2">Speaks:</span>
			<div class="flex gap-2">
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
