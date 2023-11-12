<script lang="ts">
	import { classToCalendarEntry } from '$lib/components/Calendar'
	import Calendar from '$lib/components/Calendar/Calendar.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'

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
	<h1 slot="title" class="h1">Calendar</h1>
	<Calendar {events} calendarMode="student" />
</Layout>
