import type { AppRedirect } from '$lib/utils/redirect'
import type { AdapterUser } from '@auth/core/adapters'
import type { DefaultSession } from '@auth/core/types'
import type { PrismaClient, Profile, User } from '@prisma/client'
import type { AvailableLanguageTag } from 'i18n/runtime'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// haveSession: () => Promise<SessionResult>
			session: {
				user: AdapterUser & DefaultSession['user'] // To keep the default types
			} | null
			user: Profile | null
			db: PrismaClient
			lang: AvailableLanguageTag
			redirect: AppRedirect
		}
		interface PageData {
			user: Profile
		}
		// interface Platform {}
	}
}

type SessionResult = HaveSession | NoSession
type HaveSession = {
	ok: true
	session: {
		user: AdapterUser & DefaultSession['user'] // To keep the default types
	}
	getUser: () => Promise<User>
}
type NoSession = { ok: false }

export {}
