<script lang="ts">
	import { classToCalendarEntry } from '$lib/components/Calendar'
	import Calendar from '$lib/components/Calendar/Calendar.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'

	export let data

	const toastStore = getToastStore()
	$: if (!data.success) {
		toastStore.trigger({
			message: data.message,
			background: 'bg-error-500'
		})
	}

	$: events = data.classes.map((c) => classToCalendarEntry(c))
</script>

<Layout>
	<h1 slot="title" class="h1">{$t('calendar.title')}</h1>
	<Calendar {events} calendarMode="student" />
</Layout>
