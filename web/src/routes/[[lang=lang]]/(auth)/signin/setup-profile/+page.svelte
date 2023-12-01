<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
	import RoleCard from '$lib/components/RoleCard.svelte'
	import StudentIcon from '$lib/icons/StudentIcon.svelte'
	import TeacherIcon from '$lib/icons/TeacherIcon.svelte'
</script>

<Layout>
	<h1 slot="title" class="h1 pb-4 text-center">Create your profile</h1>

	<h3 class="h3">Choose a role</h3>

	<div
		class="grid max-w-2xl grid-rows-2 space-y-4 md:grid-cols-2 md:grid-rows-1 md:space-x-4 md:space-y-0"
	>
		<a href={route('/signin/setup-profile/student', langParams())}>
			<RoleCard desc="Become a NEM Student now." title="NEM Student">
				<StudentIcon />
			</RoleCard>
		</a>
		<a href={route('/signin/setup-profile/teacher', langParams())}>
			<RoleCard desc="Become a NEM Agent now." title="NEM Agent">
				<TeacherIcon />
			</RoleCard>
		</a>
	</div>
</Layout>
