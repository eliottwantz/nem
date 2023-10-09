<script lang="ts">
	import { goto } from '$app/navigation'
	import Layout from '$lib/components/Layout.svelte'

	export let data
</script>

<Layout>
	<h1 slot="title" class="h1">Classes</h1>

	<div class="table-container">
		<!-- Native Table Element -->
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Name</th>
					<th>Language</th>
					<th>Topic</th>
					<th>Start</th>
					<th>End</th>
				</tr>
			</thead>
			<tbody>
				{#each data.classes as row, i}
					<tr
						on:click={() => goto(`/dashboard/teacher/classes/${row.id}`)}
						class="cursor-pointer hover:!bg-primary-300"
					>
						<td>{row.name}</td>
						<td>{row.language}</td>
						<td>{row.topic}</td>
						<td>{row.startAt}</td>
						<td>{row.endAt}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th>Total</th>
					<td>{data.classes.length}</td>
				</tr>
			</tfoot>
		</table>
	</div>
</Layout>

<style>
	.table tbody td {
		font-size: 1rem;
	}
</style>
