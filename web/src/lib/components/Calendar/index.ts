import type { Class, TimeSlot } from '$lib/api/api.gen'
import { dayFromDate, hourNumToTimeFormat, timeFromDateHHMM } from '$lib/utils/datetime'

export type CalendarEntry = {
	id: string
	allDay: boolean
	start: Date
	end: Date
	title: string
	editable: boolean
	startEditable: boolean
	durationEditable: boolean
	textColor?: string
	backgroundColor?: string
}

export type CalendarSelectInfo = {
	start: Date
	end: Date
	allDay: boolean
	jsEvent: Event
	view: CalendarView
	resource: CalendarRessource
}

export type CalendarResizeInfo = {
	event: CalendarEvent
	oldEvent: CalendarEvent
	jsEvent: Event
	view: CalendarView
	revert: () => void
}

export type CalendarView = {
	title: string
	currentStart: Date
	currentEnd: Date
	activeStart: Date
	activeEnd: Date
}

export type CalendarRessource = {
	id: string
	title: string
	titleHTML: string
	eventBackgroundColor: string
	eventTextColor: string
}

export type CalendarEvent = {
	id: string
	allDay: boolean
	start: Date
	end: Date
	title: string
	editable: boolean
	startEditable: boolean
	durationEditable: boolean
	backgroundColor?: string
	textColor?: string
	extendedProps?: Record<string, any>
}

export type CalendarInteractEvent = {
	event: CalendarEvent
	view: CalendarView
	jsEvent: Event
}

export const calendarViews = {
	mobile: {
		month: 'listWeek',
		week: 'listWeek',
		day: 'listWeek'
	},
	desktop: {
		month: 'dayGridMonth',
		week: 'timeGridWeek',
		day: 'timeGridDay'
	}
} as const

export const calendarModes = {
	teacher: 'teacher',
	student: 'student',
	selectCourse: 'selectCourse'
} as const
export type CalendarMode = keyof typeof calendarModes

export const calendarTimes = [
	'00:00',
	'01:00',
	'02:00',
	'03:00',
	'04:00',
	'05:00',
	'06:00',
	'07:00',
	'08:00',
	'09:00',
	'10:00',
	'11:00',
	'12:00',
	'13:00',
	'14:00',
	'15:00',
	'16:00',
	'17:00',
	'18:00',
	'19:00',
	'20:00',
	'21:00',
	'22:00',
	'23:00',
	'24:00',
]

export function isTimeAfter(startAt: string, endAt: string) {
	const [h1, m1] = startAt.split(':')
	const [h2, m2] = endAt.split(':')
	const start = new Date(`2023-01-01T${h1}:${m1}`)
	const end = new Date(`2023-01-01T${h2}:${m2}`)
	return end.getTime() - start.getTime() > 0
}

export function classToCalendarEntry(c: Class): CalendarEntry {
	return {
		id: c.id,
		allDay: false,
		start: new Date(c.startAt),
		end: new Date(c.endAt),
		title: c.name,
		editable: false,
		startEditable: false,
		durationEditable: false,
		backgroundColor: '#039be5',
		textColor: '#fff'
	}
}

export function availabilityToCalendarEntry(timeslot: TimeSlot): CalendarEntry {
	return {
		id: `${timeslot.id}`,
		allDay: false,
		start: new Date(timeslot.startAt),
		end: new Date(timeslot.endAt),
		title: 'Available',
		editable: true,
		startEditable: true,
		durationEditable: true,
		backgroundColor: '#fbdc90'
	}
}

export function availabilityToCalendarEntryOneHourBlock(timeslot: TimeSlot): CalendarEntry[] {
	// Make it local time
	const [startHour] = timeFromDateHHMM(new Date(timeslot.startAt)).split(':').map(Number)
	const [endHour] = timeFromDateHHMM(new Date(timeslot.endAt)).split(':').map(Number)

	const numBlocks = parseInt(`${endHour - startHour}`)
	console.log('numBlocks', numBlocks)

	const startDay = dayFromDate(new Date(timeslot.startAt))
	const endDay = dayFromDate(new Date(timeslot.endAt))

	let currentStartHour = startHour
	let currentEndHour = startHour + 1
	const events: CalendarEntry[] = []
	for (let i = 0; i < numBlocks; i++) {
		const startAt = `${startDay}T${hourNumToTimeFormat(currentStartHour)}:00`
		const endAt = `${endDay}T${hourNumToTimeFormat(currentEndHour)}:00`
		events.push({
			id: timeslot.id,
			allDay: false,
			start: new Date(startAt),
			end: new Date(endAt),
			title: 'Available',
			editable: false,
			startEditable: false,
			durationEditable: false,
			backgroundColor: '#fbdc90'
		})
		currentStartHour++
		currentEndHour++
	}

	return events
}
