<script lang="ts">
	import Chatbox from '$lib/components/Chatbox/Chatbox.svelte'

	export let data
</script>

<Chatbox chatId={data.conversation.id} recepient={data.recipient} />
