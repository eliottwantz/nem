<script lang="ts">
	import { ListBox, popup, type PopupSettings } from '@skeletonlabs/skeleton'
	import Avatar from '$lib/components/Avatar.svelte'
	import type { Profile } from '@prisma/client'
	import { getInitials, getPublicName } from '$lib/utils/initials'
	import { route } from '$lib/ROUTES'
	import { langParams } from '$i18n'
	import { page } from '$app/stores'

	export let email: string
	export let user: Profile

	const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupFeatured',
		// Defines which side of your trigger the popup will appear
		placement: 'bottom'
	}
</script>

<button use:popup={popupFeatured}>
	<Avatar
		class="cursor-pointer hover:border-primary-500"
		src={user.avatarUrl ?? ''}
		initials={getInitials(user)}
	/>
</button>

<div class="card w-72 shadow-xl" data-popup="popupFeatured">
	<div class="px-4 py-1">
		<p>{user.firstName} {user.lastName}</p>
		<small>{email}</small>
	</div>
	<ul class="list-nav flex flex-col gap-y-2">
		<hr class="divider" />
		<li>
			<a href={route('/dashboard/profile', langParams())}>Profile</a>
		</li>
		<li>
			<a href={route('/dashboard/profile/account', langParams())}>Account</a>
		</li>
		{#if $page.data.user.role === 'student'}
			<a href={route('/dashboard/profile/subscriptions', langParams())}>Subscriptions</a>
		{/if}
		{#if $page.data.user.role === 'teacher'}
			<a href={route('/dashboard/profile/students', langParams())}>Students</a>
		{/if}
		<hr class="divider" />
		<li>
			<a href={route('/signout', langParams())}>Signout</a>
		</li>
	</ul>
</div>
