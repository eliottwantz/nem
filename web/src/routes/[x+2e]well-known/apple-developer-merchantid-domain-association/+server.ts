import { apiEndpoint } from '$lib/api'

export async function GET() {
	try {
		const res = await fetch(`${apiEndpoint}/apple-verif-file`)
		if (!res.ok) return new Response(null, { status: res.status })
		const file = await res.text()
		return new Response(file, { status: 200 })
	} catch (e) {
		console.log(e)
		return new Response(null, { status: 400 })
	}
}
