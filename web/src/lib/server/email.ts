import { GMAIL_PASSWORD, GMAIL_SENDER_EMAIL, GMAIL_USER } from '$env/static/private'
import { PUBLIC_ENV } from '$env/static/public'
import type { Class, User } from '$lib/api/api.gen'
import ClassCanceled from '$lib/emails/ClassCanceled.svelte'
import { createTransport } from 'nodemailer'
import { render } from 'svelte-email'

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

		const transporter = createTransport({
			host: PUBLIC_ENV === 'DEV' ? 'smtp.ethereal.email' : 'smtp.gmail.com',
			port: 587,
			secure: false,
			auth: {
				user: PUBLIC_ENV === 'DEV' ? 'adelle.cartwright@ethereal.email' : GMAIL_USER,
				pass: PUBLIC_ENV === 'DEV' ? 'tb3bUQ1UUFMEPTFWST' : GMAIL_PASSWORD
			}
		})
		const res = await transporter.sendMail({
			from: GMAIL_SENDER_EMAIL,
			to: email,
			subject: 'Class canceled by ' + teacherName,
			html
		})
		return res
	} catch (error) {
		console.error(error)
	}
}
