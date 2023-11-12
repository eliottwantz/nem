import { redirect } from '@sveltejs/kit'

export function appRedirect(
	status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308,
	location: string,
	currentUrl: URL
) {
	const locale = currentUrl.pathname.split('/').splice(1)[0]
	return redirect(status, `/${locale}/${location}`)
}
