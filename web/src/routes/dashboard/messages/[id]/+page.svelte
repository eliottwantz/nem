<script lang="ts">
	import Chatbox from '$lib/components/Chatbox/Chatbox.svelte'

	export let data
</script>

<Chatbox conversationId={data.conversation.id} />
