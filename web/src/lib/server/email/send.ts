import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private'
import { getFeedbackObjects } from '$lib/utils/feedback.ts'
import { SMTPClient } from 'emailjs'

const client = new SMTPClient({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	ssl: false,
	user: SMTP_USER,
	password: SMTP_PASSWORD
})

export const sendEmail = async (options: {
	from: string
	to: string
	subject: string
	html: string
}) => {
	try {
		await client.sendAsync({
			text: options.subject,
			from: options.from,
			to: options.to,
			subject: options.subject,
			attachment: [{ data: options.html, alternative: true }]
		})

		console.log('Test email sent successfully')

		return getFeedbackObjects([
			{
				type: 'success',
				title: 'Test email sent successfully',
				message: 'Check your inbox for the test email.'
			}
		])
	} catch (e) {
		console.error(e)

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
