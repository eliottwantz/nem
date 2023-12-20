<script lang="ts">
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import type { Profile } from '@prisma/client'
	import Avatar from '../Avatar.svelte'

	export let profile: Profile
	$: console.log('profile', profile)
	export let avatarWidth = 'w-28'
	export let avatarHeight = 'h-28'
	export let textClass = ''
</script>

<div class="flex items-center gap-1">
	<Avatar
		width={avatarWidth}
		height={avatarHeight}
		src={profile.avatarUrl ?? undefined}
		initials={getInitials(profile)}
	/>
	<div>
		<p class="sm:text-lg {textClass}">
			{getPublicName(profile)}
		</p>
	</div>
</div>
