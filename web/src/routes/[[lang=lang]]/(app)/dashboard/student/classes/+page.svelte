<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import UserProfile from '$lib/components/Profile/UserProfile.svelte'
	import { Tab, TabGroup } from '@skeletonlabs/skeleton'

	export let data
	let classes = data.classes
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
	<h1 slot="title">Classes</h1>

	{#if classes.length > 0}
		<TabGroup class="w-full">
			<Tab bind:group={tabSet} name="tab1" value={0}>Upcoming</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>Previous</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<div class="table-container">
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Language</th>
									<th>Topic</th>
									<th>Teacher</th>
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
											goto(`/dashboard/student/classes/${row.id}`)}
										class="cursor-pointer hover:!bg-primary-300"
									>
										<td class="!align-middle">{row.language}</td>
										<td class="!align-middle">{row.topic}</td>
										<td class="!align-middle">
											<UserProfile
												avatarHeight="h-10"
												avatarWidth="w-10"
												profile={row.teacher.profile}
											/>
										</td>
										<td class="!align-middle"
											>{new Date(row.timeSlot.startAt).toLocaleString(
												$page.data.user.preferedLanguage
											)}</td
										>
										<td class="!align-middle"
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
									<td>{upcomingClasses.length}</td>
								</tr>
							</tfoot>
						</table>
					</div>
				{:else if tabSet === 1}
					<div class="table-container">
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Language</th>
									<th>Topic</th>
									<th>Teacher</th>
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
											goto(`/dashboard/student/classes/${row.id}`)}
										class="cursor-pointer hover:!bg-primary-300"
									>
										<td class="!align-middle">{row.language}</td>
										<td class="!align-middle">{row.topic}</td>
										<td class="!align-middle">
											<UserProfile
												avatarHeight="h-10"
												avatarWidth="w-10"
												profile={row.teacher.profile}
											/>
										</td>
										<td class="!align-middle"
											>{new Date(row.timeSlot.startAt).toLocaleString(
												$page.data.user.preferedLanguage
											)}</td
										>
										<td class="!align-middle"
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
									<td>{pastClasses.length}</td>
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
