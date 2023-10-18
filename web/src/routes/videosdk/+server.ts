import { VIDEO_SDK_SECRET_KEY } from '$env/static/private'
import { PUBLIC_VIDEO_SDK_API_KEY } from '$env/static/public'
import { json } from '@sveltejs/kit'
import { sign } from 'jsonwebtoken'

export async function GET() {
	const options = { expiresIn: '10m', algorithm: 'HS256' }

	const payload = {
		apikey: PUBLIC_VIDEO_SDK_API_KEY,
		permissions: ['allow_join', 'allow_mod'] // also accepts "ask_join"
	}

	//@ts-expect-error
	const token = sign(payload, VIDEO_SDK_SECRET_KEY, options)
	return json({ token })
}
