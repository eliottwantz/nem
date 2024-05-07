import { sourceLanguageTag, type AvailableLanguageTag } from '$i18n/paraglide/runtime'
import { route } from '$lib/ROUTES'
import { prisma } from '$lib/server/prisma'
import { appJsonMessage } from '$lib/utils/json'
import { Prisma } from '@prisma/client'
import { redirect, type Handle } from '@sveltejs/kit'

export const handleContext: Handle = async ({ event, resolve }) => {
	console.log('\n', 'REQ. Method:', event.request.method, event.url.toString())
	if (event.url.pathname.includes('stripe')) return await resolve(event)
	if (event.url.pathname.includes('.well-known')) return await resolve(event)

	console.log('#### HOOKS ######')
	const session = await event.locals.getSession()

	event.locals.session = session
	event.locals.db = prisma
	event.locals.lang = (event.params.lang as AvailableLanguageTag) ?? sourceLanguageTag
	event.locals.message = appJsonMessage

	if (event.url.pathname.startsWith('/verifyRequest')) {
		let lang = event.cookies.get('lang') ?? event.locals.lang
		throw redirect(302, `/${lang}/verifyRequest`)
	}
	if (event.cookies.get('lang') !== event.locals.lang) {
		event.cookies.set('lang', event.locals.lang, { path: '/' })
	}

	const { pathname } = event.url
	const isProtectedRoute = pathname.includes('/dashboard')
	console.log('isProtectedRoute:', isProtectedRoute, 'Have session:', session !== null)

	if (isProtectedRoute && !session) {
		throw redirect(302, route('/signin', { lang: event.locals.lang }))
	}

	const handleNoProfile = () => {
		console.log('User needs to create his profile')
		if (!pathname.includes('/signout') && !pathname.includes('/verifyRequest'))
			throw redirect(302, route('/signin/setup-profile', { lang: event.locals.lang }))
	}

	if (session) {
		try {
			const profile = await event.locals.db.profile.findUnique({
				where: { id: session.user.id }
			})
			console.log('profile:', profile)
			if (profile) event.locals.user = profile
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2025' && !pathname.includes('/signin/setup-profile'))
					handleNoProfile()
				else {
					console.log('Cannot get user profile from db')
					console.log(e)
				}
			}
		}
		if (!event.locals.user && !pathname.includes('/signin/setup-profile')) {
			handleNoProfile()
		}
	}

	return await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done) {
				return html
					.replace('%lang%', event.locals.lang)
					.replace('%dir%', event.locals.lang === 'ar' ? 'rtl' : 'ltr')
			}
		}
	})
}
