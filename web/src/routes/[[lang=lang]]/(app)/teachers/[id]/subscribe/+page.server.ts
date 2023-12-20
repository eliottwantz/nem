import { safeDBCall } from '$lib/utils/error'
import { redirect } from '@sveltejs/kit'

export async function load({ url, locals: { db } }) {
	const id = url.searchParams.get('plan-id')
	if (!id) throw redirect(302, url.href.replace('subscribe', ''))
	const res = await safeDBCall(db.subscription.findUnique({ where: { id } }))
	if (!res.ok) {
		console.log(res.error)
		return {
			subscription: null
		}
	}
	return {
		subscription: res.value
	}
}
