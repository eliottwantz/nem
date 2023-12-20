<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/UserProfile.svelte'

	export let data
</script>

<Layout>
	<Profile profile={data.userToShow} />
	{#if data.user.role === 'student' && data.userToShow.role === 'teacher'}
		<a
			href={route('/teachers/[id]', { id: data.userToShow.id, lang: langParams().lang })}
			class="variant-filled-primary btn"
		>
			Schedule a class with this teacher
		</a>
	{/if}
</Layout>
