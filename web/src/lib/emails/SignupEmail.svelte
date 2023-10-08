<script lang="ts">
	import { Html, Link, Text } from 'svelte-email'

	export let firstName: string
	export let confirmationUrl: string

	const fontFamily =
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'

	const h1 = {
		fontFamily,
		fontSize: '32px',
		lineHeight: '1.3',
		fontWeight: '700'
	}
	const h2 = {
		fontFamily,
		fontSize: '18px',
		lineHeight: '1.2',
		fontWeight: '600'
	}
</script>

<Html lang="en">
	<Text style={h1}>Hey {firstName}! Thanks for joining NEM!</Text>

	<Text>
		We're thrilled to have you join our community. To get started, there's just one more step to
		complete your registration: confirming your email address.
	</Text>

	<Text>
		Click the confirmation link to verify your email address:
		<Link href={confirmationUrl}>{confirmationUrl}</Link>
	</Text>

	<Text>
		If you encounter any issues during the signup process or need assistance, please don't
		hesitate to contact our friendly support team at contact@nempass.com. We're here to help you
		every step of the way.
	</Text>

	<Text>
		We're thrilled to have you join NEM and can't wait to see what you accomplish within our
		community. Thank you for choosing us as your platform for reinventing modern education.
	</Text>

	<Text style={h2}>Best regards, The NEM Team</Text>
</Html>
