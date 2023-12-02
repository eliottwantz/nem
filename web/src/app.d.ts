import type { AppRedirect } from '$lib/utils/redirect'
import type { AdapterUser } from '@auth/core/adapters'
import type { DefaultSession, Session } from '@auth/core/types'
import type { PrismaClient, Profile, User } from '@prisma/client'
import type { AvailableLanguageTag } from '$i18n/paraglide/runtime'
import type { AppJsonMessage } from '$lib/utils/json'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare module '@auth/core/types' {
	interface Session {
		user: AdapterUser & DefaultSession['user']
	}
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null
			user: Profile | null
			db: PrismaClient
			lang: AvailableLanguageTag
			redirect: AppRedirect
			message: AppJsonMessage
		}
		interface PageData {
			user: Profile
		}
		// interface Platform {}
	}
}

export {}
