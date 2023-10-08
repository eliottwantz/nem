<script lang="ts">
	import type { Class } from '$lib/api/api.gen'
	import { Html, Text } from 'svelte-email'

	export let classs: Class
	export let teacherName: string

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
	<Text style={h1}>Class {classs.name} canceled by your teacher {teacherName}</Text>

	<Text>
		Please note that your class at {classs.startAt} - {classs.endAt} has been canceled by your teacher
		{teacherName}.
	</Text>

	<Text>
		If you have any questions or concerns, please don't hesitate to contact our friendly support
		team at contact@nempass.com.
	</Text>

	<Text style={h2}>Best regards, The NEM Team</Text>
</Html>
