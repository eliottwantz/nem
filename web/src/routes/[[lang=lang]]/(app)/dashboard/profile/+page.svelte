<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton'
	import ProfileForm from './profile-form.svelte'

	export let form

	const toastStore = getToastStore()
	$: if (form) {
		toastStore.trigger({
			message: form.text,
			background: form.type === 'success' ? 'bg-success-500' : 'bg-error-500',
			autohide: form.type === 'success'
		})
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Profile</h3>
		<p class="text-muted-foreground text-sm">This is how others will see you on the site.</p>
	</div>
	<hr class="separator my-6" />

	<ProfileForm />
</div>
