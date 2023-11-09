<script lang="ts">
	import { goto } from '$app/navigation'
	import Layout from '$lib/components/Layout.svelte'
	import RoleCard from '$lib/components/RoleCard.svelte'
	import StudentIcon from '$lib/icons/StudentIcon.svelte'
	import TeacherIcon from '$lib/icons/TeacherIcon.svelte'
	import { t } from 'svelte-i18n'
</script>

<Layout>
	<h1 slot="title" class="h1 pb-4 text-center">{$t('setup-profile.title')}</h1>

	<h3 class="h3">{$t('register.role')}</h3>

	<div
		class="grid max-w-2xl grid-rows-2 space-y-4 md:grid-cols-2 md:grid-rows-1 md:space-x-4 md:space-y-0"
	>
		<a href="/signin/setup-profile/student">
			<RoleCard
				desc={$t('register.roles.studentMessage')}
				title={$t('register.roles.student')}
			>
				<StudentIcon />
			</RoleCard>
		</a>
		<a href="/signin/setup-profile/teacher">
			<RoleCard
				desc={$t('register.roles.teacherMessage')}
				title={$t('register.roles.teacher')}
			>
				<TeacherIcon />
			</RoleCard>
		</a>
	</div>
</Layout>
