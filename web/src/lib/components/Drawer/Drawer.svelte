<script lang="ts">
	import { userStore } from '$lib/stores/user'

	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton'
	import AdminSidebar from '../Sidebar/AdminSidebar.svelte'
	import { drawerStoreIds } from '.'
	import Chatbox from '../Chatbox/Chatbox.svelte'
	import DefaultSidebar from '../Sidebar/DefaultSidebar.svelte'
	import TeacherSidebar from '../Sidebar/TeacherSidebar.svelte'
	import StudentSidebar from '../Sidebar/StudentSidebar.svelte'

	const drawerStore = getDrawerStore()
</script>

<Drawer bgDrawer="bg-surface-300-600-token">
	{#if $drawerStore.id === drawerStoreIds.sidebar}
		{#if $userStore?.role === 'admin'}
			<AdminSidebar />
		{:else if $userStore?.role === 'teacher'}
			<TeacherSidebar />
		{:else if $userStore?.role === 'student'}
			<StudentSidebar />
		{:else}
			<DefaultSidebar />
		{/if}
	{:else if $drawerStore.id === drawerStoreIds.chat}
		<Chatbox currentClassDetails={$drawerStore.meta.classDetails} />
	{/if}
</Drawer>
