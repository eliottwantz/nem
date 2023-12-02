import { sourceLanguageTag, type AvailableLanguageTag } from '$i18n/paraglide/runtime'
import { prisma } from '$lib/server/prisma'
import { appJsonMessage } from '$lib/utils/json'
import { appRedirect } from '$lib/utils/redirect'
import { Prisma } from '@prisma/client'
import { redirect, type Handle } from '@sveltejs/kit'

export const handleContext: Handle = async ({ event, resolve }) => {
	const session = await event.locals.getSession()
	console.log('######')
	console.log('Have session:', session !== null)
	console.log('Session:', session)

	event.locals.session = session
	event.locals.db = prisma
	event.locals.lang = (event.params.lang as AvailableLanguageTag) ?? sourceLanguageTag
	event.locals.redirect = appRedirect(event.locals.lang)
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
	console.log(
		'REQ. Method:',
		event.request.method,
		event.url.toString(),
		'isProtectedRoute:',
		isProtectedRoute,
		'Have session:',
		session !== null
	)

	if (isProtectedRoute && !session) {
		throw event.locals.redirect(302, '/signin')
	}

	const handleNoProfile = () => {
		console.log('User needs to create his profile')
		if (!pathname.includes('/signout') && !pathname.includes('/verifyRequest'))
			throw event.locals.redirect(302, '/signin/setup-profile')
	}

	if (session) {
		try {
			const profile = await event.locals.db.profile.findUnique({
				where: { id: session.user.id }
			})
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
