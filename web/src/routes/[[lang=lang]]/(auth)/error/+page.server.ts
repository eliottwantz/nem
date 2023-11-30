export async function load({ cookies }) {
	cookies.delete('next-auth.session-token', { path: '/' })
}
