<script lang="ts">
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import type { TableSource } from '@skeletonlabs/skeleton'
	import {
		Paginator,
		Table,
		tableMapperValues,
		type PaginationSettings,
		tableSourceValues
	} from '@skeletonlabs/skeleton'

	export let data

	let tableSource: TableSource
	let tablePage: PaginationSettings
	let paginatedSource: string[][]
	let { users } = data

	$: if (tableSource) {
		paginatedSource = tableSource.body.slice(
			tablePage.page * tablePage.limit, // start
			tablePage.page * tablePage.limit + tablePage.limit // end
		)
	}

	tableSource = {
		head: [
			'ID',
			'FirstName',
			'LastName',
			'Role',
			'Prefered Lang',
			'Avatar Path',
			'Avatar URL',
			'Created At'
		],
		body: tableSourceValues(users),
		meta: tableSourceValues(users),
		foot: ['Total', `${users.length}`]
	}

	tablePage = {
		page: 0,
		limit: 5,
		size: tableSource.body.length,
		amounts: [5, 15, 30]
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Users</h1>

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
	<a href="{$page.url.pathname}/create" class="btn bg-primary-active-token"> Add new user </a>
</Layout>
