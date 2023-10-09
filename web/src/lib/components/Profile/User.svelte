<script lang="ts">
	import type { User } from '$lib/api/api.gen'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import Avatar from '../Avatar.svelte'

	export let user: User
</script>

<div class="flex items-center gap-1">
	<Avatar
		width="w-28"
		height="h-28"
		src={user.avatarUrl}
		initials={getInitials(user.firstName, user.lastName)}
	/>
	<div>
		<p class="flex-auto text-lg font-semibold">
			{getPublicName(user.firstName, user.lastName)}
		</p>
	</div>
</div>
