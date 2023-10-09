import type { User } from '$lib/api/api.gen'
import { SupabaseClient, Session, type User as AuthUser } from '@supabase/supabase-js'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient
			session: Session | null
			user: User | null
		}
		interface PageData {
			supabase: SupabaseClient
			session: Session
			user: User
		}
		// interface Platform {}
	}
}

export {}
