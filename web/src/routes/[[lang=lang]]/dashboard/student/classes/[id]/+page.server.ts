import { safeDBCall } from '$lib/utils/error'

export async function load({ locals: { session, redirect, db }, params }) {
	if (!session) throw redirect(302, '/signin')
	const res = await safeDBCall(
		db.class.findUnique({
			where: { id: params.id },
			include: {
				timeSlot: true,
				teacher: true
			}
		})
	)
	if (!res.ok) {
		console.log(res.error)
		throw redirect(302, '/dashboard/teacher/classes?notFound=' + params.id)
	}
	console.log(res.value)
	return {
		class: res.value
	}
}
