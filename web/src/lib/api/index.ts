import { PUBLIC_ENV, PUBLIC_GO_SERVER_HOST } from '$env/static/public'
import type { Session } from '@supabase/supabase-js'
import {
	AdminServiceAPI,
	ClassServiceAPI,
	MessageServiceAPI,
	StudentServiceAPI,
	TeacherServiceAPI,
	UserServiceAPI,
	WebrpcError,
	type Fetch
} from './api.gen'

export let apiEndpoint =
	PUBLIC_ENV === 'DEV'
		? `http://${PUBLIC_GO_SERVER_HOST}/api`
		: `https://${PUBLIC_GO_SERVER_HOST}/api`

export const doFetch = (f: Fetch, session: Session): Fetch => {
	return (input, init) => {
		return f(input, {
			...init,
			headers: {
				...init?.headers,
				Authorization: `Bearer ${session?.access_token}`
			}
		})
	}
}

export const fetchers = {
	userService: (f: Fetch, session: Session) =>
		new UserServiceAPI(apiEndpoint, doFetch(f, session)),
	classService: (f: Fetch, session: Session) =>
		new ClassServiceAPI(apiEndpoint, doFetch(f, session)),
	adminService: (f: Fetch, session: Session) =>
		new AdminServiceAPI(apiEndpoint, doFetch(f, session)),
	teacherService: (f: Fetch, session: Session) =>
		new TeacherServiceAPI(apiEndpoint, doFetch(f, session)),
	studentService: (f: Fetch, session: Session) =>
		new StudentServiceAPI(apiEndpoint, doFetch(f, session)),
	messageService: (f: Fetch, session: Session) =>
		new MessageServiceAPI(apiEndpoint, doFetch(f, session))
} as const

export async function safeFetch<T>(fetchPromise: Promise<T>): Promise<FetchResult<T>> {
	try {
		const res = await fetchPromise
		return {
			ok: true,
			data: res
		}
	} catch (e) {
		const error = e as WebrpcError
		let { message, cause } = error
		if (!cause) cause = message
		return {
			ok: false,
			error,
			cause: cause ? cause : message
		}
	}
}

export type FetchResult<T> = FetchSuccess<T> | FetchError
type FetchSuccess<T> = { ok: true; data: T }
type FetchError = { ok: false; error: WebrpcError; cause: string }
