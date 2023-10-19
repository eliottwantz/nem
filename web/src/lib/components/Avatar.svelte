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
	background="bg-primary-200"
	{width}
	{height}
	rounded="rounded-full"
	border="border-2  border-primary-600"
	class="{$$props.class} select-none"
/>
