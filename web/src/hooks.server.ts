import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { fetchers, safeFetch } from '$lib/api'
import { defaultLocale } from '$lib/i18n'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { redirect } from '@sveltejs/kit'
import { locale } from 'svelte-i18n'

export async function handle({ event, resolve }) {
	console.log('hooks.server ran')

	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event
	})

	let lang = defaultLocale

	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession()
	event.locals.session = session
	const isProtectedRoute = event.url.pathname.startsWith('/dashboard')
	console.log(
		'REQ. Method:',
		event.request.method,
		event.url.pathname,
		'isProtectedRoute:',
		isProtectedRoute,
		'Have session:',
		session !== null
	)

	if (isProtectedRoute && !session) {
		locale.set(lang)
		throw redirect(302, '/login?unauthicated=true&next=' + event.url.pathname)
	}

	if (session) {
		const res = await safeFetch(fetchers.userService(event.fetch, session).get())
		if (!res.ok) {
			if (
				res.cause === 'user not found' &&
				!event.url.pathname.startsWith('/register/setup-profile')
			) {
				console.log('User needs to create his profile')
				throw redirect(302, '/register/setup-profile')
			}
			console.log('Cannot get user from db')
			console.log(res.error)
		} else {
			event.locals.user = res.data.user
			lang = res.data.user.preferedLanguage
		}
	}

	locale.set(lang)

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range'
		}
	})
}
