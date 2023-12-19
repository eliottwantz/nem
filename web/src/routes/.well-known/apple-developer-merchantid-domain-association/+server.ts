import { RequestHandler } from '@sveltejs/kit'
import appleFile from '../../../../static/apple-stripe-file.txt?raw'

export const GET: RequestHandler = async () => {
	return new Response(appleFile)
}
