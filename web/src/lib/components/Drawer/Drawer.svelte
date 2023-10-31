<script lang="ts">
	import { userStore } from '$lib/stores/user'

	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton'
	import { drawerStoreIds } from '.'
	import DrawerChatbox from '../Chatbox/DrawerChatbox.svelte'
	import AdminSidebar from '../Sidebar/AdminSidebar.svelte'
	import DefaultSidebar from '../Sidebar/DefaultSidebar.svelte'
	import StudentSidebar from '../Sidebar/StudentSidebar.svelte'
	import TeacherSidebar from '../Sidebar/TeacherSidebar.svelte'

	const drawerStore = getDrawerStore()
</script>

<Drawer bgDrawer="bg-surface-300-600-token w-5/6">
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
		<DrawerChatbox
			conversationId={$drawerStore.meta.conversationId}
			recepient={$drawerStore.meta.recepient}
		/>
	{/if}
</Drawer>
