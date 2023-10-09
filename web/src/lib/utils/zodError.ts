import type { ZodIssue } from 'zod'

export function issuesToString(issues: ZodIssue[]): string {
	return issues.map((i) => `${i.path}:${i.message}`).join('.')
}
