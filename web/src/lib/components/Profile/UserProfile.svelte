<script lang="ts">
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import type { Profile } from '@prisma/client'
	import Avatar from '../Avatar.svelte'

	export let user: Profile
	export let avatarWidth = 'w-28'
	export let avatarHeight = 'h-28'
	export let textClass = ''
</script>

<div class="flex items-center gap-1">
	<Avatar
		width={avatarWidth}
		height={avatarHeight}
		src={user.avatarUrl ?? undefined}
		initials={getInitials(user.firstName, user.lastName)}
	/>
	<div>
		<p class="flex-auto text-lg {textClass}">
			{getPublicName(user.firstName, user.lastName)}
		</p>
	</div>
</div>
