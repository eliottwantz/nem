<script lang="ts">
	import { browser } from '$app/environment'
	import type {
		CalendarEntry,
		CalendarInteractEvent,
		CalendarMode,
		CalendarResizeInfo,
		CalendarSelectInfo
	} from '.'
	// @ts-expect-error No types for librairy
	import Calendar from '@event-calendar/core'
	// @ts-expect-error No types for librairy
	import TimeGridPlugin from '@event-calendar/time-grid'
	// @ts-expect-error No types for librairy
	import DayPlugin from '@event-calendar/day-grid'
	// @ts-expect-error No types for librairy
	import ListPlugin from '@event-calendar/list'
	// @ts-expect-error No types for librairy
	import InteractionPlugin from '@event-calendar/interaction'

	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { fetchers, safeFetch } from '$lib/api'
	import type { Class } from '$lib/api/api.gen'
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton'
	import { locale, t } from 'svelte-i18n'
	import { calendarViews } from '.'
	import AddCalendarEvent from './AddCalendarEvent.svelte'
	import ManageCalendarEvent from './ManageCalendarEvent.svelte'

	export let events: CalendarEntry[]
	export let calendarMode: CalendarMode
	export let eventClick: ((cal: any, info: CalendarInteractEvent) => Promise<void>) | undefined =
		undefined

	const modalStore = getModalStore()
	const toastStore = getToastStore()
	let cal: any
	let isMobile = browser ? window.innerWidth < 768 : false
	let views: { month: string; week: string; day: string } = calendarViews.mobile
	$: views = isMobile ? calendarViews.mobile : calendarViews.desktop
	let view: 'month' | 'week' | 'day' = 'week'
	let plugins = [TimeGridPlugin, DayPlugin, ListPlugin, InteractionPlugin]
	let options = {
		view: views[view],
		allDaySlot: false,
		events,
		firstDay: 1,
		selectable: calendarMode === 'teacher',
		eventTextColor: '#000',
		selectBackgroundColor: '#fbdc90',
		slotDuration: '01:00:00',
		slotHeight: '50',
		selectLongPressDelay: 0,
		nowIndicator: true,
		select(info: CalendarSelectInfo) {
			console.log('NEW EVENT', info)
			modalStore.trigger({
				type: 'component',
				component: {
					ref: AddCalendarEvent,
					props: { cal, info }
				}
			})
		},
		eventResize(info: CalendarResizeInfo) {
			console.log('RESIZE', info)
			if (!info.event.editable) {
				info.revert()
				return
			}
			modalStore.trigger({
				type: 'component',
				component: {
					ref: ManageCalendarEvent,
					props: { cal, info: { ...info, mode: 'resize' } }
				}
			})
		},
		async eventClick(info: CalendarInteractEvent) {
			console.log('CLICKED', info)
			if (eventClick !== undefined) {
				await eventClick(cal, info)
				return
			}
			if (info.event.editable) {
				modalStore.trigger({
					type: 'component',
					component: {
						ref: ManageCalendarEvent,
						props: { cal, info: { ...info, mode: 'click' } }
					}
				})
			} else {
				const currentClass = $page.data.classes.find((c: Class) => c.id === info.event.id)
				if (!currentClass) {
					toastStore.trigger({
						message: 'An error occured',
						background: 'variant-filled-error'
					})
					return
				}
				if ($page.data.user?.role === 'teacher') {
					await goto(`/dashboard/teacher/classes/${currentClass.id}`)
				} else {
					await goto(`/dashboard/student/classes/${currentClass.id}`)
				}
				// modalStore.trigger({
				// 	type: 'confirm',
				// 	title: 'Join Class',
				// 	body: 'Are you sure you want to join the class?',
				// 	response: async (confirmed: boolean) => {
				// 		if (!confirmed) return
				// 		const currentClass = $page.data.classes.find(
				// 			(c: Class) => c.id === info.event.id
				// 		)
				// 		if (!currentClass) {
				// 			toastStore.trigger({
				// 				message: 'An error occured',
				// 				background: 'variant-filled-error'
				// 			})
				// 			return
				// 		}

				// 		const res = await safeFetch(
				// 			calendarMode === 'teacher'
				// 				? fetchers.teacherService(fetch, $page.data.session!).startClass({
				// 						classId: currentClass.id
				// 				  })
				// 				: fetchers.studentService(fetch, $page.data.session!).joinClass({
				// 						classId: currentClass.id
				// 				  })
				// 		)
				// 		if (!res.ok) {
				// 			toastStore.trigger({
				// 				message: res.cause,
				// 				background: 'variant-filled-error'
				// 			})
				// 			return
				// 		}

				// 		await goto(`/class/${currentClass.id}`)
				// 	}
				// })
			}
		},
		eventDrop(info: CalendarInteractEvent) {
			console.log('DRAGGED', info)
			modalStore.trigger({
				type: 'component',
				component: {
					ref: ManageCalendarEvent,
					props: { cal, info: { ...info, mode: 'drag' } }
				}
			})
		}
	}

	$: if (cal) {
		cal.setOption('locale', $locale)
		cal.setOption('buttonText', {
			close: $t('close'),
			dayGridMonth: $t('month'),
			listDay: $t('list'),
			listMonth: $t('list'),
			listWeek: $t('list'),
			listYear: $t('list'),
			resourceTimeGridDay: $t('day'),
			resourceTimeGridWeek: $t('week'),
			timeGridDay: $t('day'),
			timeGridWeek: $t('week'),
			today: $t('today')
		})
	}

	$: if (cal) {
		cal.setOption('view', views[view])
	}

	function responsiveFormats(node: HTMLDivElement) {
		const resizeEv = (ev: UIEvent) => {
			isMobile = window.innerWidth < 768
		}

		window.addEventListener('resize', resizeEv)

		return {
			destroy() {
				console.log('destroy cal')
				window.removeEventListener('resize', resizeEv)
			}
		}
	}
</script>

{#if browser}
	<div class="mt-4 flex gap-4">
		{#if calendarMode === 'teacher'}
			<button
				on:click={() =>
					modalStore.trigger({
						type: 'component',
						component: { ref: AddCalendarEvent, props: { cal } }
					})}
				class="variant-filled-primary btn"
			>
				<span>
					<svg
						class="h-7 w-7"
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						><path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 12h6m0 0h6m-6 0v6m0-6V6"
						/></svg
					>
				</span>
				<span>Add availability</span>
			</button>
		{/if}
		{#if !isMobile}
			<div class="flex items-center gap-2">
				<p class="text-2xl">View</p>
				<select class="select" name="view" bind:value={view}>
					{#each Object.keys(views) as v}
						<option value={v}>{v}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	<div use:responsiveFormats class="h-full max-h-[50rem] w-full overflow-y-auto">
		<Calendar bind:this={cal} {plugins} {options} />
	</div>
{/if}

<style>
	:global(.ec-time),
	:global(.ec-line) {
		height: 50px;
	}
</style>
