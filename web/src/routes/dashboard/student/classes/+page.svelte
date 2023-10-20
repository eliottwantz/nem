<script lang="ts">
	import { goto } from '$app/navigation'
	import Layout from '$lib/components/Layout.svelte'
	import UserProfile from '$lib/components/Profile/UserProfile.svelte'

	export let data
</script>

<Layout>
	<h1 slot="title" class="h1">Classes</h1>

	<div class="table-container">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Language</th>
					<th>Topic</th>
					<th>Teacher</th>
					<th>Start</th>
					<th>End</th>
				</tr>
			</thead>
			<tbody>
				{#each data.classes as row, i}
					<tr
						on:click={() => goto(`/dashboard/student/classes/${row.id}`)}
						class="cursor-pointer hover:!bg-primary-300"
					>
						<td class="!align-middle">{row.language}</td>
						<td class="!align-middle">{row.topic}</td>
						<td class="!align-middle">
							<UserProfile
								avatarHeight="h-10"
								avatarWidth="w-10"
								user={{
									avatarFilePath: row.teacherAvatarFilePath,
									avatarUrl: row.teacherAvatarUrl,
									firstName: row.teacherFirstName,
									lastName: row.teacherLastName,
									id: row.teacherId
								}}
							/>
						</td>
						<td class="!align-middle">{row.startAt}</td>
						<td class="!align-middle">{row.endAt}</td>
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
