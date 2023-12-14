<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import Avatar from '$components/Avatar.svelte'
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import { getInitials } from '$lib/utils/initials'
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton'

	$: ({ user } = $page.data)

	const toastStore = getToastStore()

	let files: FileList
	let uploading = false
	let previewSrc = ''
	$: if (files && files.length > 0) previewSrc = URL.createObjectURL(files[0])
	$: if (files && files.length === 0 && previewSrc) {
		URL.revokeObjectURL(previewSrc)
	}
</script>

<div>
	<div class="mb-4 space-y-4">
		<label class="label">
			<span>First Name</span>
			<input
				class="input"
				type="text"
				name="firstName"
				title="First Name (readonly)"
				placeholder={user.firstName}
				readonly
				tabindex="-1"
			/>
		</label>
		<label>
			<span>Last Name</span>
			<input
				class="input"
				type="text"
				name="lastName"
				title="Last Name (readonly)"
				placeholder={user.lastName}
				readonly
				tabindex="-1"
			/>
		</label>
	</div>
	<form
		class="space-y-4"
		method="post"
		action={route('updateAvatar /dashboard/profile', langParams())}
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
		<label for="avatar" class="label"> Profile picture </label>
		<div class="flex items-center gap-x-8">
			<FileButton
				id="avatar"
				button="variant-glass p-0"
				name="avatar"
				bind:files
				required
				accept="image/*"
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
			<div class="flex flex-col gap-y-2">
				<button disabled={uploading} class="variant-ghost-primary btn">Upload avatar</button
				>
				<form
					method="post"
					action={route('deleteAvatar /dashboard/profile', langParams())}
					use:enhance
				>
					<button class="variant-ghost btn">Delete avatar</button>
				</form>
			</div>
		</div>
	</form>
</div>
