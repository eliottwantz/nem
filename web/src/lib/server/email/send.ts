import { dev } from '$app/environment'
import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private'
import { getFeedbackObjects } from '$lib/utils/feedback.ts'
import { SMTPClient } from 'emailjs'

const client = new SMTPClient({
	user: SMTP_USER,
	password: SMTP_PASSWORD,
	port: Number(SMTP_PORT),
	host: SMTP_HOST,
	ssl: dev ? false : true
})

export const sendEmail = async (options: { to: string; subject: string; html: string }) => {
	try {
		const message = await client.sendAsync({
			text: options.html,
			from: 'NEM noreply@passnem.com',
			to: options.to,
			subject: options.subject,
			'content-type': 'text/html'
		})

		console.log('Email sent successfully')

		return getFeedbackObjects([
			{
				type: 'success',
				title: 'Email sent successfully',
				message: 'Check your inbox for the email.'
			}
		])
	} catch (e) {
		console.error(e)

		return getFeedbackObjects([
			{
				type: 'error',
				title: 'Error sending email',
				message:
					'An unknown error occurred while sending the email. Please try again later.'
			}
		])
	}
}
