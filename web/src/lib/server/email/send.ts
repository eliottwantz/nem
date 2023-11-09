import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private'
import { getFeedbackObjects } from '$lib/utils/feedback.ts'
import { createTransport } from 'nodemailer'

const transporter = createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: false,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASSWORD
	}
})

export const sendEmail = async (options: {
	from: string
	to: string
	subject: string
	html: string
}) => {
	try {
		transporter.sendMail({
			from: options.from,
			to: options.to,
			subject: options.subject,
			html: options.subject
		})

		console.log('Test email sent successfully')

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
