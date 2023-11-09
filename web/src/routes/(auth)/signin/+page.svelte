<script lang="ts">
	import Layout from '$lib/components/Layout.svelte'
	import OauthLogin from '$lib/components/Oauth/OauthLogin.svelte'
	import { t } from 'svelte-i18n'

	export let data
</script>

<Layout>
	<h1 slot="title" class="h1">{$t('login.login')}</h1>

	<section class="flex flex-col gap-y-4">
		<OauthLogin />
		<span class="text-center">Or</span>
		<form
			class="space-y-2"
			method="post"
			action="/auth/signin/email?callbackUrl=/dashboard/profile"
		>
			<input type="text" name="csrfToken" value={data.csrfToken} class="hidden" />
			<label class="label">
				<span>{$t('login.email')}</span>
				<input placeholder="email@example.com" class="input" name="email" type="email" />
			</label>
			<button class="btn w-full bg-primary-active-token">Sign in</button>
		</form>
	</section>
</Layout>
