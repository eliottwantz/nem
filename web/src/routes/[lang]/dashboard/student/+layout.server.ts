export async function load({ locals: { user, redirect }, url }) {
	if (!user) throw redirect(302, '/signin')
	console.log('student layout.server.ts')
	if (user.role !== 'student') {
		const redirectUrl = url.pathname.replace('student', 'teacher')
		throw redirect(302, redirectUrl)
	}
}
