<script lang="ts">
	import { enhance } from '$app/forms'
	import Avatar from '$lib/components/Avatar.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import { getInitials } from '$lib/utils/initials'
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton'

	export let data
	export let form

	const toastStore = getToastStore()
	$: if (form) {
		toastStore.trigger({
			message: form.text,
			background: form.type === 'success' ? 'bg-success-500' : 'bg-error-500',
			autohide: form.type === 'success'
		})
	}

	let files: FileList
	let uploading = false
	$: console.log('AVATAR PATH', data.user.avatarFilePath)
	$: console.log('AVATAR URL', data.user.avatarUrl)

	function onChangeHandler(e: Event): void {
		console.log('file data:', e)
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Edit Your Profile</h1>
	<form method="post" class="mb-4 space-y-2" use:enhance action="?/changePass">
		<label>
			<span>New Password</span>
			<input class="input" type="password" name="newPassword" />
		</label>
		<label>
			<span>Confirm New Password</span>
			<input class="input" type="password" name="newPasswordConfirm" />
		</label>
		<button class="variant-filled-surface btn">Change Password</button>
	</form>

	<form
		class="space-y-2"
		method="post"
		action="?/updateAvatar"
		enctype="multipart/form-data"
		use:enhance={({ cancel }) => {
			uploading = true
			if (!files || files.length === 0) {
				toastStore.trigger({
					message: 'No file selected. Please select a file.',
					background: 'bg-error-500'
				})
				cancel()
			}

			return async ({ update }) => {
				await update()
				uploading = false
			}
		}}
	>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">
			<span>Profile picture</span>
			<FileButton
				button="variant-glass p-0"
				name="avatar"
				bind:files
				accept="image/*"
				on:change={onChangeHandler}
			>
				<Avatar
					src={data.user.avatarUrl}
					initials={getInitials(data.user.firstName, data.user.lastName)}
					width="w-20"
				/>
			</FileButton>
		</label>
		<button disabled={uploading} class="variant-ghost-primary btn">Upload</button>
	</form>
	<form method="post" action="?/deleteAvatar" use:enhance>
		<button class="variant-glass-surface btn">Delete avatar</button>
	</form>
</Layout>
