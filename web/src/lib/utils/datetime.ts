export function dateToISO(input: Date): string {
	return input.toISOString()
}

export function stringToISO(input: string): string {
	return new Date(input).toISOString()
}

export function stringToLocalTime(input: string): string {
	return new Date(input).toLocaleString()
}

export function dateToLocalTime(input: Date): Date {
	const offset = input.getTimezoneOffset()
	input = new Date(input.getTime() - offset * 60 * 1000)
	return input
}

export function dayFromDate(input: Date): string {
	return dateToLocalTime(input).toISOString().split('T')[0]
}

export function timeFromDateHHMM(input: Date): string {
	const h = input.getHours()
	const m = input.getMinutes()
	return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`
}

export function hourNumToTimeFormat(num: number): string {
	return `${num < 10 ? '0' : ''}${num}:00`
}

// Convert a time in "HH:MM" format and day in "YYYY-MM-DD" format to a Date
export function timeToDateHHMM(time: string, day: string): Date {
	const [h, m] = time.split(':')
	const [y, mm, d] = day.split('-')
	return new Date(`${y}-${mm}-${d}T${h}:${m}`)
}
