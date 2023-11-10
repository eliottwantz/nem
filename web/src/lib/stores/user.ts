import type { Profile } from '@prisma/client'
import { writable } from 'svelte/store'

export const userStore = writable<Profile | null>(null)
