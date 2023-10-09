import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase }, cookies }) => {
	const code = url.searchParams.get('code')
	if (!code) {
		throw redirect(302, '/register/verify-email?state=invalid-code')
	}

	const { error } = await supabase.auth.exchangeCodeForSession(code)
	if (error) {
		console.log(error)
		throw redirect(302, '/register/verify-email?state=invalid-code')
	}
	cookies.delete('email', { path: '/' })
	throw redirect(302, '/register/setup-profile')
}
