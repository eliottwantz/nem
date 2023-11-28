export async function safeFetch<T>(fetchPromise: Promise<Response>): Promise<FetchResult<T>> {
	try {
		const res = await fetchPromise
		const data = await res.json()
		if (!res.ok) return { ok: false, error: new Error((data as APIErrorJson).message) }
		return {
			ok: true,
			data
		}
	} catch (e) {
		const error = e as Error
		let { message, cause } = error
		if (!cause) cause = message
		return {
			ok: false,
			error
		}
	}
}

export type FetchResult<T> = FetchSuccess<T> | FetchError
type FetchSuccess<T> = { ok: true; data: T }
type FetchError = { ok: false; error: Error }
export type APIErrorJson = { message: string }
