import type { ModalComponent } from '@skeletonlabs/skeleton'
import AddEvent from '../Calendar/AddCalendarEvent.svelte'
import TakeTrialClass from '../TakeTrialClass/TakeTrialClass.svelte'
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
		ref: TakeTrialClass
	}
} as const
