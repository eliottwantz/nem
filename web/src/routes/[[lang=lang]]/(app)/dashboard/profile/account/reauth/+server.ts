import { stripe } from '$lib/server/stripe'
import { redirect } from '@sveltejs/kit'

export const GET = async ({ cookies, url }) => {
	const accountId = cookies.get('account-id')
	if (!accountId) return new Response('Bad request', { status: 400 })

	const accountLink = await stripe.accountLinks.create({
		account: accountId,
		refresh_url: `${url.toString()}/reauth`,
		return_url: `${url.toString()}/return`,
		type: 'account_onboarding'
	})

	console.log('accountLink', accountLink)

	throw redirect(302, accountLink.url)
}
