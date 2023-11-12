<script lang="ts">
	import { page } from '$app/stores'
	import CalendarIcon from '$lib/icons/CalendarIcon.svelte'
	import ClassesIcon from '$lib/icons/ClassesIcon.svelte'
	import CloseIcon from '$lib/icons/CloseIcon.svelte'
	import CurrentClass from '$lib/icons/CurrentClass.svelte'
	import TeachIcon from '$lib/icons/TeachIcon.svelte'
	import { currentClassDetailsStore } from '$lib/stores/currentClass'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import { MessagesSquare } from 'lucide-svelte'
	import Locale from '../Locale.svelte'
	import Navigation from '../Navigation.svelte'
	import { href } from '$lib/utils/redirect'

	const drawerStore = getDrawerStore()
</script>

<div class="bg-surface-100-800-token flex h-full flex-col p-2 sm:space-y-4 sm:p-4 lg:border-r">
	<div class="flex items-center py-1 pl-2 lg:hidden">
		<CloseIcon on:click={() => drawerStore.close()} />
		<div class="flex-grow"></div>
		<Locale />
	</div>

	<hr class="border-surface-token divider border-t-2 lg:hidden" />

	<h2 class="pl-4 font-semibold sm:pl-9 sm:text-2xl lg:hidden">Navigation</h2>
	<div class="flex flex-col pl-6 lg:hidden lg:pl-0">
		<Navigation horizontal={false} />
	</div>

	<hr class="border-surface-token divider border-t lg:hidden" />

	<h2 class="pl-4 font-semibold sm:pl-9 sm:text-2xl lg:hidden">Personal</h2>
	<div class="flex flex-col pl-4 text-lg sm:pl-8 lg:pl-0">
		<nav class="list-nav">
			<ul>
				<li>
					<a
						href={href('/teachers')}
						class="flex {$page.url.pathname === '/teachers'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<TeachIcon />
						<span> Teachers </span>
					</a>
				</li>
				<li>
					<a
						href={href('/dashboard/student/classes')}
						class="flex {$page.url.pathname === '/dashboard/student/classes'
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
						href={href('/dashboard/student/calendar')}
						class="flex {$page.url.pathname === '/dashboard/student/calendar'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<CalendarIcon />
						<span> Calendar </span>
					</a>
				</li>
				<li>
					<a
						href={href('/dashboard/messages')}
						class="flex {$page.url.pathname.startsWith('/dashboard/messages')
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<MessagesSquare size="32" />
						<span> Messages </span>
					</a>
				</li>
				{#if $currentClassDetailsStore}
					<li>
						<a
							href={href('/class/{$currentClassDetailsStore?.class.id}')}
							class="flex {$page.url.pathname ===
							`/class/${$currentClassDetailsStore?.class.id}`
								? 'bg-primary-active-token'
								: ''}"
							on:click={() => drawerStore.close()}
						>
							<CurrentClass />
							<span> Current Class </span>
						</a>
					</li>
				{/if}
			</ul>
		</nav>
	</div>

	<!-- <hr class="border-surface-token divider border-t" /> -->
</div>
