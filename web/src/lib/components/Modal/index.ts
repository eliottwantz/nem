import type { ModalComponent } from '@skeletonlabs/skeleton'
import EditClassForm from './EditClassForm.svelte'
import AddEvent from '../Calendar/AddCalendarEvent.svelte'

export const ModalComponents = {
	editClassForm: 'editClassForm',
	addCalendarEvent: 'addCalendarEvent'
} as const

type ModalKeys = keyof typeof ModalComponents

export const modalComponentRegistry: Record<ModalKeys, ModalComponent> = {
	editClassForm: {
		ref: EditClassForm
	},
	addCalendarEvent: {
		ref: AddEvent
	}
} as const
