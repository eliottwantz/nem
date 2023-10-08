<script lang="ts">
	import type { User } from '$lib/api/api.gen'
	import { getInitials } from '$lib/utils/initials'
	import Avatar from '../Avatar.svelte'

	export let user: User
</script>

<Avatar src={user.avatarUrl} initials={getInitials(user.firstName, user.lastName)} />
<span class="flex-auto">{user.firstName + ' ' + user.lastName}</span>
