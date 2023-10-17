import { PUBLIC_ZOOMSDK_KEY, PUBLIC_ZOOMSDK_SECRET } from '$env/static/public'
import { error, json } from '@sveltejs/kit'
import { KJUR } from 'jsrsasign'

export async function POST({ request }) {
	try {
		const { meetingNumber, role } = await request.json()
		const iat = Math.round(new Date().getTime() / 1000)
		const exp = iat + 60 * 60 * 2

		const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' })
		const payload = JSON.stringify({
			sdkKey: PUBLIC_ZOOMSDK_KEY,
			appKey: PUBLIC_ZOOMSDK_KEY,
			mn: meetingNumber,
			role,
			iat,
			exp,
			tokenExp: exp
		})
		const signature = KJUR.jws.JWS.sign('HS256', header, payload, PUBLIC_ZOOMSDK_SECRET)
		return json({ signature })
	} catch (e) {
		throw error(
			500,
			e instanceof Error
				? e.message
				: 'Something went wrong creating access token with Zoom SDK'
		)
	}
}
