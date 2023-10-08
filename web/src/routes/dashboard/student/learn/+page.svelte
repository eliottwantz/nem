<script lang="ts">
	import type { Learn } from '$lib/api/api.gen'
	import Layout from '$lib/components/Layout.svelte'
	import SelectLearn from '$lib/components/SelectLearn.svelte'
	import Arabic from '$lib/i18n/flags/Arabic.svelte'
	import English from '$lib/i18n/flags/English.svelte'
	import French from '$lib/i18n/flags/French.svelte'
	import { getToastStore } from '@skeletonlabs/skeleton'
	import type { ComponentType } from 'svelte'
	import { t } from 'svelte-i18n'

	export let data
	export let form

	const toastStore = getToastStore()
	$: if (form && form.success)
		toastStore.trigger({ message: form.message, background: 'bg-success-500' })
	$: if (form && !form.success)
		toastStore.trigger({ message: form.message, background: 'bg-error-500' })

	$: console.log('learn data', data)

	let { learns } = data
	$: ({ learns } = data)
	console.log('learns', learns)

	$: languages = Array.from(new Set(learns.map((learn) => learn.language)))
	$: console.log('languages', languages)
</script>

<Layout>
	<h1 slot="title" class="h1">{$t('learn.title')}</h1>

	<SelectLearn {languages} learns={data.learns} initialTeacher={data.selectedTeacher} />
</Layout>
