<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import Profile from '$lib/components/Profile/Teacher.svelte'

	export let data
	console.log(data.teachers)
</script>

<Layout>
	<h1 slot="title" class="h1">Find a Teacher</h1>

	<div class="flex flex-col gap-y-4">
		{#each data.teachers as teacher}
			<Profile shortForm={true} {teacher} />
		{/each}
	</div>
</Layout>
