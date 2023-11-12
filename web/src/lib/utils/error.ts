class AppError extends Error {
	metadata?: Record<string, string>
	constructor(baseError: Error, metadata?: Record<string, string>) {
		super(baseError.message)
		Object.setPrototypeOf(this, AppError.prototype)
		this.stack = baseError.stack
		this.message = baseError.message
		this.name = baseError.name
		this.cause = baseError.cause
		this.metadata = metadata
	}
}

export async function safeDBCall<T>(prismaPromise: Promise<T | null>): Promise<DBResult<T>> {
	try {
		const res = await prismaPromise
		if (!res) return { ok: false, error: new AppError(new Error('Not found')) }
		else return { ok: true, value: res }
	} catch (e) {
		return { ok: false, error: new AppError(e as Error) }
	}
}

export type DBResult<T> = ResultSuccess<T> | ResultError
type ResultSuccess<T> = { ok: true; value: T }
type ResultError = { ok: false; error: AppError }
