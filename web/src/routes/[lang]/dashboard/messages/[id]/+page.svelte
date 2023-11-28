<script lang="ts">
	import { page } from '$app/stores'
	import Chatbox from '$lib/components/Chatbox/Chatbox.svelte'

	export let data
</script>

<Chatbox chatId={$page.params.id} recepient={data.recipient} />
