<script lang="ts">
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import type { TableSource } from '@skeletonlabs/skeleton'
	import {
		Paginator,
		Table,
		tableSourceValues,
		type PaginationSettings
	} from '@skeletonlabs/skeleton'

	export let data

	let tableSource: TableSource
	let tablePage: PaginationSettings
	let paginatedSource: string[][]
	let { classes } = data

	$: if (tableSource) {
		paginatedSource = tableSource.body.slice(
			tablePage.page * tablePage.limit, // start
			tablePage.page * tablePage.limit + tablePage.limit // end
		)
	}

	tableSource = {
		head: ['ID', 'Name', 'Language', 'Topic', 'Start', 'End', 'Created At', 'Updated At'],
		body: tableSourceValues(classes),
		meta: tableSourceValues(classes),
		foot: ['Total', `${classes.length}`]
	}

	tablePage = {
		page: 0,
		limit: 5,
		size: tableSource.body.length,
		amounts: [5, 15, 30]
	}

	// Pour edit dans le futur
	// function onSelected(meta: CustomEvent<string[]>) {
	//     modalStore.trigger({
	//         type: 'component',
	//         component: ModalComponents.createCourseForm,
	//         meta: {
	//             course: meta.detail,
	//         },
	//     })

	//     console.log(meta.detail)
	// }
	// function openCreateModal() {
	//     modalStore.trigger({
	//         type: 'component',
	//         component: ModalComponents.editClassForm,
	//     })
	// }
</script>

<Layout>
	<h1 slot="title" class="h1">Classes</h1>

	{#if tableSource}
		<Table
			source={{
				head: tableSource.head,
				body: paginatedSource,
				meta: tableSource.meta,
				foot: tableSource.foot
			}}
		/>
		<Paginator
			bind:settings={tablePage}
			showFirstLastButtons={true}
			showPreviousNextButtons={true}
		/>
	{/if}
	<a href="{$page.url.pathname}/create" class="btn bg-primary-active-token"> Add new class </a>
</Layout>
