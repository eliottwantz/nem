<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/Profile.svelte'

	export let data
</script>

<Layout>
	<Profile user={data.userToShow} />
	{#if data.user.role === 'student' && data.userToShow.role === 'teacher'}
		<a
			href="/dashboard/student/learn?teacherId={data.userToShow.id}"
			class="variant-filled-primary btn">Schedule a class with this teacher</a
		>
	{/if}
</Layout>
