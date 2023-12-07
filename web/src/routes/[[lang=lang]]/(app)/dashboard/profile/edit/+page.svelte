<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import Avatar from '$lib/components/Avatar.svelte'
	import Layout from '$lib/components/Layout.svelte'
	import { getInitials } from '$lib/utils/initials'
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton'

	export let form

	$: ({ user } = $page.data)
	$: console.log('Got user data', user)

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
	let previewSrc = ''
	$: if (files && files.length > 0) previewSrc = URL.createObjectURL(files[0])
	$: if (files && files.length === 0 && previewSrc) {
		URL.revokeObjectURL(previewSrc)
	}
	$: console.log('preview url', previewSrc)
	$: console.log('AVATAR PATH', user.avatarFilePath)
	$: console.log('AVATAR URL', user.avatarUrl)

	function onChangeHandler(e: Event): void {
		console.log('file data:', e)
	}
</script>

<Layout>
	<h1 slot="title" class="h1">Edit Your Profile</h1>
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
				required
				accept="image/*"
				on:change={onChangeHandler}
			>
				{#if previewSrc}
					<!-- Preview -->
					<Avatar src={previewSrc} initials={getInitials(user)} width="w-20" />
				{:else}
					<Avatar
						src={user.avatarUrl ? user.avatarUrl : undefined}
						initials={getInitials(user)}
						width="w-20"
					/>
				{/if}
			</FileButton>
		</label>
		<button disabled={uploading} class="variant-ghost-primary btn">Upload</button>
	</form>
	<form method="post" action="?/deleteAvatar" use:enhance>
		<button class="variant-glass-surface btn">Delete avatar</button>
	</form>
</Layout>
