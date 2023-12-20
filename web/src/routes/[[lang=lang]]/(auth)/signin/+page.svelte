<script lang="ts">
	import { page } from '$app/stores'
	import Layout from '$lib/components/Layout.svelte'
	import OauthLogin from '$lib/components/Oauth/OauthLogin.svelte'

	export let data
	let callbackUrl = `${$page.params.lang ? `/${$page.params.lang}` : ''}/signin/setup-profile`
	console.log('callbackUrl', callbackUrl)
</script>

<Layout>
	<h1 slot="title">Sign In</h1>

	<div class="flex justify-center">
		<section class="flex flex-col gap-y-4">
			<OauthLogin />
			<span class="text-center">Or</span>
			<form
				class="space-y-2"
				method="post"
				action="/auth/signin/email?callbackUrl={callbackUrl}"
			>
				<input type="hidden" name="csrfToken" value={data.csrfToken} />
				<label class="label">
					<span>Email</span>
					<input
						placeholder="email@example.com"
						class="input"
						name="email"
						type="email"
					/>
				</label>
				<button class="btn w-full bg-primary-active-token">Sign in</button>
			</form>
		</section>
	</div>
</Layout>
