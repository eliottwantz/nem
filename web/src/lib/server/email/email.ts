import { EMAIL_FROM } from '$env/static/private'
import ClassCanceled from '$lib/emails/ClassCanceled.svelte'
import { render } from 'svelte-email'
import { sendEmail } from './send'
import { getFeedbackObjects } from '$lib/utils/feedback.ts'
import type { Class, Profile, TimeSlot } from '@prisma/client'
import { getPublicName } from '$lib/utils/initials'

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
			from: EMAIL_FROM,
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
