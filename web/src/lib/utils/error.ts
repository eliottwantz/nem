export class AppError extends Error {
	status: number
	metadata?: Record<string, string>
	constructor(message: string, status: number, metadata?: Record<string, string>) {
		super(message)
		this.metadata = metadata
		this.status = status
	}
}

export async function safeDBCall<T>(prismaPromise: Promise<T | null>): Promise<DBResult<T>> {
	try {
		const res = await prismaPromise
		if (!res) return { ok: false, error: new AppError('Not found', 404) }
		else return { ok: true, value: res }
	} catch (e) {
		return { ok: false, error: e as Error }
	}
}

export type DBResult<T> = ResultSuccess<T> | ResultError
type ResultSuccess<T> = { ok: true; value: T }
type ResultError = { ok: false; error: Error }

export function dbLoadPromise<T>(promise: Promise<DBResult<T>>, fallBack: T): Promise<T> {
	return new Promise((resolve) => {
		promise.then((data) => {
			if (data.ok) resolve(data.value)
			else resolve(fallBack)
		})
	})
}
