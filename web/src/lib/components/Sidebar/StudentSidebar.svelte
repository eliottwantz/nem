<script lang="ts">
	import { page } from '$app/stores'
	import LangSwitcher from '$components/LangSwitcher.svelte'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import CalendarIcon from '$lib/icons/CalendarIcon.svelte'
	import ClassesIcon from '$lib/icons/ClassesIcon.svelte'
	import CloseIcon from '$lib/icons/CloseIcon.svelte'
	import TeachIcon from '$lib/icons/TeachIcon.svelte'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import { MessagesSquare } from 'lucide-svelte'
	import Navigation from '../Navigation.svelte'

	const drawerStore = getDrawerStore()

	$: activeUrl = $page.url.pathname
</script>

<div class="bg-surface-100-800-token flex h-full flex-col p-2 sm:space-y-4 sm:p-4 lg:border-r">
	<div class="flex items-center py-1 pl-2 lg:hidden">
		<CloseIcon on:click={() => drawerStore.close()} />
		<div class="flex-grow"></div>
		<LangSwitcher />
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
						href={route('/teachers', langParams())}
						class="flex {activeUrl === '/'
							? ''
							: route('/teachers', langParams()).startsWith(activeUrl)
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
						href={route('/dashboard/student/classes', langParams())}
						class="flex {activeUrl === route('/dashboard/student/classes', langParams())
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
						href={route('/dashboard/student/calendar', langParams())}
						class="flex {activeUrl ===
						route('/dashboard/student/calendar', langParams())
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
						href={route('/dashboard/messages', langParams())}
						class="flex {activeUrl === route('/dashboard/messages', langParams())
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<MessagesSquare size="32" />
						<span> Messages </span>
					</a>
				</li>
			</ul>
		</nav>
	</div>
</div>
