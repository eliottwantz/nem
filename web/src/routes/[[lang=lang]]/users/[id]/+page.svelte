<script lang="ts">
	import Link from '$components/Link.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/UserProfile.svelte'

	export let data
</script>

<Layout>
	<Profile profile={data.userToShow} />
	{#if data.user.role === 'student' && data.userToShow.role === 'teacher'}
		<Link
			href="/dashboard/student/learn?teacherId={data.userToShow.id}"
			class="variant-filled-primary btn"
		>
			Schedule a class with this teacher
		</Link>
	{/if}
</Layout>
