<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton'
	import ProfileForm from './profile-form.svelte'
	import { route } from '$lib/ROUTES'
	import { langParams } from '$i18n'
	import { page } from '$app/stores'
	import { LucideExternalLink } from 'lucide-svelte'

	export let data
	export let form

	$: profileUrl = `${$page.url.origin}${route('/teachers/[id]', {
		lang: langParams().lang,
		id: data.user.id
	})}`

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
		<h3 class="text-xl font-medium">Profile</h3>
		<p class="text-muted-foreground text-sm">This is how others will see you on the site.</p>
		<div class="mt-4 flex items-center gap-x-2">
			<p>Profile URL:</p>
			<a
				class="anchor flex flex-wrap gap-x-1 break-all text-sm underline decoration-dotted underline-offset-4 sm:text-base"
				target="_blank"
				href={route('/teachers/[id]', { lang: langParams().lang, id: data.user.id })}
			>
				{profileUrl}
				<LucideExternalLink size="14" />
			</a>
		</div>
	</div>
	<hr class="separator my-6" />

	<ProfileForm />
</div>
