import type { User } from '$lib/api/api.gen'
import { writable } from 'svelte/store'

export const userStore = writable<User | null>(null)
