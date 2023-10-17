<script lang="ts">
	import { page } from '$app/stores'
	import { PUBLIC_ZOOMSDK_KEY, PUBLIC_ZOOMSDK_SECRET } from '$env/static/public'
	import Layout from '$lib/components/Layout.svelte'

	import { onMount } from 'svelte'

	let meetingSDKElement: HTMLDivElement

	onMount(async () => {
		const meetingNumber = $page.url.searchParams.get('meetingNumber') || '123456789'
		fetch($page.url.pathname, {
			method: 'POST',
			body: JSON.stringify({
				meetingNumber,
				role: 1
			})
		})
			.then((res) => res.json())
			.then(async (data) => {
				const zoomSDK = await import('@zoomus/websdk/embedded')
				console.log('zoomSDK', zoomSDK)
				const client = zoomSDK.default.createClient()
				console.log('client', client)
				await client.init({
					zoomAppRoot: meetingSDKElement,
					language: 'en-US',
					debug: true
				})
				client.join({
					signature: data.signature,
					sdkKey: PUBLIC_ZOOMSDK_KEY,
					meetingNumber,
					password: $page.url.searchParams.get('password') || 'Pass',
					userName: $page.url.searchParams.get('userName') || 'Dev',
					tk: '123456789',
					zak: '123456789',
					success: (joined: any) => {
						console.log('-- joined --> ', joined)
					},
					error: (error: any) => {
						console.log('-- error --> ', error)
					}
				})
			})
			.catch((e) => console.log('ERROR -->>> ', e))
	})
</script>

<Layout>
	<h1 class="h1" slot="title">Zoom shit</h1>

	<div bind:this={meetingSDKElement} id="meetingSDKElement">
		<!-- Zoom Meeting SDK Rendered Here -->
	</div>
</Layout>
