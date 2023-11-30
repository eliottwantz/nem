<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import { Tab, TabGroup } from '@skeletonlabs/skeleton'

	export let data
	let upcomingClasses = data.classes.filter((c) => {
		if (new Date(c.timeSlot.endAt) >= new Date()) return true
		else return false
	})
	let pastClasses = data.classes.filter((c) => {
		if (new Date(c.timeSlot.endAt) < new Date()) return true
		else return false
	})
	let tabSet: number = 0
</script>

<Layout>
	<h1 slot="title" class="h1">Classes</h1>

	{#if data.classes.length > 0}
		<TabGroup class="w-full">
			<Tab bind:group={tabSet} name="tab1" value={0}>Upcoming</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Previous</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
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
									<th>Private?</th>
									<th>Trial?</th>
								</tr>
							</thead>
							<tbody>
								{#each upcomingClasses as row}
									<tr
										on:click={() =>
											goto(`/dashboard/teacher/classes/${row.id}`)}
										class="cursor-pointer hover:!bg-primary-300"
									>
										<td>{row.name}</td>
										<td>{row.language}</td>
										<td>{row.topic}</td>
										<td
											>{new Date(row.timeSlot.startAt).toLocaleString(
												$page.data.user.preferedLanguage
											)}
										</td>
										<td
											>{new Date(row.timeSlot.endAt).toLocaleString(
												$page.data.user.preferedLanguage
											)}
										</td>
										<td>{row.isPrivate ? 'X' : ''}</td>
										<td>{row.isTrial ? 'X' : ''}</td>
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
				{:else if tabSet === 1}
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
									<th>Private?</th>
									<th>Trial?</th>
								</tr>
							</thead>
							<tbody>
								{#each pastClasses as row}
									<tr
										on:click={() =>
											goto(`/dashboard/teacher/classes/${row.id}`)}
										class="cursor-pointer hover:!bg-primary-300"
									>
										<td>{row.name}</td>
										<td>{row.language}</td>
										<td>{row.topic}</td>
										<td
											>{new Date(row.timeSlot.startAt).toLocaleString(
												$page.data.user.preferedLanguage
											)}
										</td>
										<td
											>{new Date(row.timeSlot.endAt).toLocaleString(
												$page.data.user.preferedLanguage
											)}
										</td>
										<td>{row.isPrivate ? 'X' : ''}</td>
										<td>{row.isTrial ? 'X' : ''}</td>
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
				{/if}
			</svelte:fragment>
		</TabGroup>
	{:else}
		<p class="text-xl">You don't have any classes scheduled</p>
	{/if}
</Layout>

<style>
	.table tbody td {
		font-size: 1rem;
	}
</style>
