import ClassCanceled from '$lib/emails/ClassCanceled.svelte'
import { getFeedbackObjects } from '$lib/utils/feedback.ts'
import { getPublicName } from '$lib/utils/initials'
import type { Class, Profile, TimeSlot } from '@prisma/client'
import { render } from 'svelte-email'
import { sendEmail } from './send'

export async function sendClassCanceledEmail(
	classs: Class & { timeSlot: TimeSlot },
	teacher: Profile,
	email: string
) {
	try {
		const teacherName = getPublicName(teacher)
		const html = render({
			template: ClassCanceled,
			props: {
				classs,
				teacherName
			}
		})

		const res = await sendEmail({
			to: email,
			subject: 'Class canceled by ' + teacherName,
			html
		})
		return res
	} catch (error) {
		console.error(error)
		return getFeedbackObjects([
			{
				type: 'error',
				title: 'Error sending test email',
				message:
					'An unknown error occurred while sending the test email. Please try again later.'
			}
		])
	}
}
