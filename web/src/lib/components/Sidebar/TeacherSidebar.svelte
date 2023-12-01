<script lang="ts">
	import { page } from '$app/stores'
	import LangSwitcher from '$components/LangSwitcher.svelte'
	import CalendarIcon from '$lib/icons/CalendarIcon.svelte'
	import ClassesIcon from '$lib/icons/ClassesIcon.svelte'
	import CloseIcon from '$lib/icons/CloseIcon.svelte'
	import CurrentClass from '$lib/icons/CurrentClass.svelte'
	import TeachIcon from '$lib/icons/TeachIcon.svelte'
	import { currentClassDetailsStore } from '$lib/stores/currentClass'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import { MessagesSquare } from 'lucide-svelte'
	import Navigation from '../Navigation.svelte'
	import { route } from '$lib/ROUTES'
	import { langParams } from '$i18n'

	const drawerStore = getDrawerStore()

	let activeUrl = $page.url.pathname
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
						href={route('/dashboard/teacher/teach', langParams())}
						class="flex {activeUrl ===
						`/${$page.params.lang ?? ''}${
							$page.params.lang ? '/' : ''
						}dashboard/teacher/teach`
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<TeachIcon />
						<span> Teach </span>
					</a>
				</li>
				<li>
					<a
						href={route('/dashboard/teacher/classes', langParams())}
						class="flex {activeUrl ===
						`/${$page.params.lang ?? ''}${
							$page.params.lang ? '/' : ''
						}dashboard/teacher/classes`
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
						href={route('/dashboard/teacher/calendar', langParams())}
						class="flex {activeUrl ===
						`/${$page.params.lang ?? ''}${
							$page.params.lang ? '/' : ''
						}dashboard/teacher/calendar`
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
						class="flex {activeUrl ===
						`/${$page.params.lang ?? ''}${
							$page.params.lang ? '/' : ''
						}dashboard/messages`
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
							href={route('/dashboard/class/[id]', {
								id: $currentClassDetailsStore?.class.id,
								lang: langParams().lang
							})}
							class="flex {activeUrl ===
							`/${$page.params.lang ?? ''}${$page.params.lang ? '/' : ''}class/${
								$currentClassDetailsStore?.class.id
							}`
								? 'bg-primary-active-token'
								: ''}"
							on:click={() => drawerStore.close()}
						>
							<CurrentClass />
							<span> CurrentClass </span>
						</a>
					</li>
				{/if}
			</ul>
		</nav>
	</div>

	<hr class="border-surface-token divider border-t" />
	<h2 class="pl-9 text-2xl font-semibold lg:hidden">Navigation</h2>
	<div class="flex flex-col pl-10 lg:hidden lg:pl-0">
		<Navigation horizontal={false} />
	</div>
</div>
