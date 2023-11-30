<script lang="ts">
	import { page } from '$app/stores'
	import ClassesIcon from '$lib/icons/ClassesIcon.svelte'
	import CloseIcon from '$lib/icons/CloseIcon.svelte'
	import ManageIcon from '$lib/icons/ManageIcon.svelte'
	import UsersIcon from '$lib/icons/UsersIcon.svelte'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import Navigation from '../Navigation.svelte'
	import LangSwitcher from '$components/LangSwitcher.svelte'

	const drawerStore = getDrawerStore()
</script>

<div class="bg-surface-100-800-token flex h-full flex-col space-y-4 p-4 lg:border-r">
	<div class="flex items-center pl-2 pt-1 lg:hidden">
		<CloseIcon on:click={() => drawerStore.close()} />
		<div class="flex-grow"></div>
		<LangSwitcher />
	</div>
	<hr class="border-surface-token divider border-t-2 lg:hidden" />

	<h2 class="pl-9 text-2xl font-semibold lg:hidden">Personal</h2>
	<div class="flex flex-col pl-8 text-lg lg:pl-0">
		<nav class="list-nav">
			<ul>
				<li>
					<a
						href="admin/list-users"
						class="flex {$page.url.pathname === '/admin/list-users'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<UsersIcon />
						<span> Users </span>
					</a>
				</li>
				<li>
					<a
						href="admin/list-classes"
						class="flex {$page.url.pathname === '/admin/list-classes'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<ClassesIcon />
						<span> Classes </span>
					</a>
				</li>
				<li>
					<a
						href="admin/manage"
						class="flex {$page.url.pathname === '/admin/manage'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<ManageIcon />
						<span> Manage </span>
					</a>
				</li>
			</ul>
		</nav>
	</div>

	<hr class="border-surface-token divider border-t" />
	<h2 class="pl-9 text-2xl font-semibold lg:hidden">Navigation</h2>
	<div class="flex flex-col pl-10 lg:hidden lg:pl-0">
		<Navigation horizontal={false} />
	</div>
</div>
