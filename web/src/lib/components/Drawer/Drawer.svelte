<script lang="ts">
	import { page } from '$app/stores'
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton'
	import { drawerStoreIds } from '.'
	import Chatbox from '../Chatbox/Chatbox.svelte'
	import AdminSidebar from '../Sidebar/AdminSidebar.svelte'
	import DefaultSidebar from '../Sidebar/DefaultSidebar.svelte'
	import StudentSidebar from '../Sidebar/StudentSidebar.svelte'
	import TeacherSidebar from '../Sidebar/TeacherSidebar.svelte'

	const drawerStore = getDrawerStore()
</script>

<Drawer bgDrawer="bg-surface-300-600-token w-5/6">
	{#if $page.data.user}
		{#if $drawerStore.id === drawerStoreIds.sidebar}
			{#if $page.data.user.role === 'admin'}
				<AdminSidebar />
			{:else if $page.data.user.role === 'teacher'}
				<TeacherSidebar />
			{:else if $page.data.user.role === 'student'}
				<StudentSidebar />
			{:else}
				<DefaultSidebar />
			{/if}
		{:else if $drawerStore.id === drawerStoreIds.chat}
			<Chatbox
				conversationId={$drawerStore.meta.conversationId}
				recepient={$drawerStore.meta.recepient}
			/>
		{/if}
	{/if}
</Drawer>
