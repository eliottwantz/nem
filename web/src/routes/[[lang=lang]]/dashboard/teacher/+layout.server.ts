export async function load({ locals: { user, redirect }, url }) {
	if (!user) throw redirect(302, '/signin')
	if (user.role !== 'teacher') {
		const redirectUrl = url.pathname.replace('teacher', 'student')
		throw redirect(302, redirectUrl)
	}
}
