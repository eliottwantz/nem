<script lang="ts">
	import { availabilityToCalendarEntry, classToCalendarEntry } from '$lib/components/Calendar'
	import Calendar from '$lib/components/Calendar/Calendar.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'

	export let data

	console.log('data.availabilities', data.availabilities)

	const toastStore = getToastStore()
	$: if (!data.success) {
		toastStore.trigger({
			message: data.message,
			background: 'bg-error-500'
		})
	}

	$: events = data.classes
		.map((c) => classToCalendarEntry(c))
		.concat(data.availabilities.map((a) => availabilityToCalendarEntry(a)))
</script>

<Layout>
	<h1 slot="title" class="h1">{$t('calendar.title')}</h1>
	<Calendar {events} calendarMode="teacher" />
</Layout>
