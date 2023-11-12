import { fetchers, safeFetch } from '$lib/api'
import { redirect } from '@sveltejs/kit'

export async function load({ fetch, url }) {
	if (!url.searchParams.get('plan-id')) throw redirect(302, url.href.replace('subscribe', ''))
	const res = await safeFetch(fetchers.subscriptionService(fetch).listSubscriptions())
	if (!res.ok) {
		console.log(res.error)
		return {
			subscriptions: []
		}
	}
	return {
		subscriptions: res.data.subscriptions
	}
}
