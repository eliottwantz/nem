import type { ModalComponent } from '@skeletonlabs/skeleton'
import AddEvent from '../Calendar/AddCalendarEvent.svelte'
import TakeClass from '../TakeClass/TakeClass.svelte'
import EditClassForm from './EditClassForm.svelte'

export const ModalComponents = {
	editClassForm: 'editClassForm',
	addCalendarEvent: 'addCalendarEvent',
	takeClass: 'takeClass'
} as const

type ModalKeys = keyof typeof ModalComponents

export const modalComponentRegistry: Record<ModalKeys, ModalComponent> = {
	editClassForm: {
		ref: EditClassForm
	},
	addCalendarEvent: {
		ref: AddEvent
	},
	takeClass: {
		ref: TakeClass
	}
} as const
