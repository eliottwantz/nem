import { SMTP_PASSWORD, EMAIL_FROM, SMTP_USER } from '$env/static/private'
import { PUBLIC_ENV } from '$env/static/public'
import type { Class, User } from '$lib/api/api.gen'
import ClassCanceled from '$lib/emails/ClassCanceled.svelte'
import { createTransport } from 'nodemailer'
import { render } from 'svelte-email'
import { sendEmail } from './send'

export async function sendClassCanceledEmail(classs: Class, teacher: User, email: string) {
	try {
		const teacherName = teacher.firstName + ' ' + teacher.lastName
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
	}
}
