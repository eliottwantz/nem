<script lang="ts">
	import Chatbox from '$lib/components/Chatbox/Chatbox.svelte'

	export let data
</script>

{#if data.conversations.length > 0}
	<Chatbox conversationId={data.conversations[0].id} />
{:else}
	<p>No conversations</p>
{/if}
