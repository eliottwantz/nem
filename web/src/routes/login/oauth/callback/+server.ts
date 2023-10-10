import { error, redirect } from '@sveltejs/kit'

export async function GET({ url, locals: { supabase } }) {
	const provider = url.searchParams.get('provider')
	console.log('hi from ' + provider + ' callback!')
	const code = url.searchParams.get('code')
	if (!code) {
		throw error(400, 'Missing oauth code')
	}
	const res = await supabase.auth.exchangeCodeForSession(code)
	if (res.error) {
		console.log(res.error)
		throw error(res.error.status ?? 400, 'Could not exchange oauth code')
	}
	throw redirect(302, '/dashboard/profile')
}
