<script lang="ts">
	import { page } from '$app/stores'
	import CalendarIcon from '$lib/icons/CalendarIcon.svelte'
	import ClassesIcon from '$lib/icons/ClassesIcon.svelte'
	import CloseIcon from '$lib/icons/CloseIcon.svelte'
	import CurrentClass from '$lib/icons/CurrentClass.svelte'
	import LearnIcon from '$lib/icons/LearnIcon.svelte'
	import { currentClassDetailsStore } from '$lib/stores/currentClass'
	import { getDrawerStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'
	import Locale from '../Locale.svelte'
	import Navigation from '../Navigation.svelte'
	import TeachIcon from '$lib/icons/TeachIcon.svelte'

	const drawerStore = getDrawerStore()
</script>

<div class="bg-surface-100-800-token flex h-full flex-col space-y-4 p-4 lg:border-r">
	<div class="flex items-center pl-2 pt-1 lg:hidden">
		<CloseIcon on:click={() => drawerStore.close()} />
		<div class="flex-grow"></div>
		<Locale />
	</div>
	<hr class="border-surface-token divider border-t-2 lg:hidden" />

	<h2 class="pl-9 text-2xl font-semibold lg:hidden">Personal</h2>
	<div class="flex flex-col pl-8 text-lg lg:pl-0">
		<nav class="list-nav">
			<ul>
				<li>
					<a
						href="/teachers"
						class="flex {$page.url.pathname === '/teachers'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<TeachIcon />
						<span>
							{$t('nav.teachers')}
						</span>
					</a>
				</li>
				<li>
					<a
						href="/dashboard/student/classes"
						class="flex {$page.url.pathname === '/dashboard/student/classes'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<ClassesIcon />
						<span>
							{$t('nav.classes')}
						</span>
					</a>
				</li>
				<li>
					<a
						href="/dashboard/student/calendar"
						class="flex {$page.url.pathname === '/dashboard/student/calendar'
							? 'bg-primary-active-token'
							: ''}"
						on:click={() => drawerStore.close()}
					>
						<CalendarIcon />
						<span>
							{$t('nav.calendar')}
						</span>
					</a>
				</li>
				{#if $currentClassDetailsStore}
					<li>
						<a
							href="/class/{$currentClassDetailsStore?.class.id}"
							class="flex {$page.url.pathname ===
							`/class/${$currentClassDetailsStore?.class.id}`
								? 'bg-primary-active-token'
								: ''}"
							on:click={() => drawerStore.close()}
						>
							<CurrentClass />
							<span>
								{$t('nav.currentClass')}
							</span>
						</a>
					</li>
				{/if}
			</ul>
		</nav>
	</div>

	<hr class="border-surface-token divider border-t lg:hidden" />
	<h2 class="pl-9 text-2xl font-semibold lg:hidden">Navigation</h2>
	<div class="flex flex-col pl-10 lg:hidden lg:pl-0">
		<Navigation horizontal={false} />
	</div>
</div>
