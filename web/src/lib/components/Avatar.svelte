<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton'

	export let src: string | undefined = undefined
	export let initials: string | undefined = undefined
	export let width = 'w-10'
	export let height = 'h-10'
</script>

<Avatar
	{src}
	{initials}
	background="bg-secondary-500"
	{width}
	{height}
	rounded="rounded-full"
	border="border-2 {src ? 'border-surface-800' : 'border-secondary-700-200-token'}"
	class="{$$props.class} select-none"
/>
