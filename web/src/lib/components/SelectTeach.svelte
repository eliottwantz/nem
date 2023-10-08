<script lang="ts">
	import { enhance } from '$app/forms'
	import type { TopicTaught } from '$lib/api/api.gen'
	import { ListBox, ListBoxItem, Step, Stepper } from '@skeletonlabs/skeleton'
	import { t } from 'svelte-i18n'

	export let languages: string[]
	export let topics: string[]
	export let topicsTaught: TopicTaught[]
	console.log('languages', languages)
	console.log('topics', topics)
	console.log('userTopicsTaught', topicsTaught)

	let form: HTMLFormElement
	let selectedLanguage: string
	let selectedTopic: string

	$: lockedLanguage = !selectedLanguage
	$: lockedTopic = !selectedTopic
	$: console.log(lockedLanguage)
	$: availableTopics = topics.filter((topic) => {
		if (
			topicsTaught
				.map((t) => `${t.language}-${t.topic}`)
				.includes(`${selectedLanguage}-${topic}`)
		)
			return false
		return true
	})

	$: console.log(selectedLanguage)
	$: console.log(selectedTopic)
	$: console.log('availableTopics', availableTopics)

	async function newTeaching() {
		if (!selectedLanguage || !selectedTopic) return
		form.submit()
	}
</script>

<form bind:this={form} use:enhance class="hidden" method="post">
	<input type="text" name="language" value={selectedLanguage} />
	<input type="text" name="topic" value={selectedTopic} />
</form>
<div class="card text-token w-full p-4">
	<Stepper
		stepTerm={$t('learn.stepper.stepTerm')}
		buttonBackLabel={$t('learn.stepper.buttonBack')}
		buttonNextLabel={$t('learn.stepper.buttonNext')}
		buttonCompleteLabel="Teach course"
		on:complete={newTeaching}
	>
		<Step locked={lockedLanguage}>
			<svelte:fragment slot="header">{$t('learn.language-teach')}</svelte:fragment>
			<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
				{#each languages as language}
					<ListBoxItem bind:group={selectedLanguage} name={language} value={language}>
						{language}
					</ListBoxItem>
				{/each}
			</ListBox>
		</Step>
		<Step locked={lockedTopic}>
			<svelte:fragment slot="header">
				{$t('learn.topic')}
			</svelte:fragment>
			<ListBox active="variant-filled-primary" hover="hover:variant-ghost-primary">
				{#each availableTopics as topic}
					<ListBoxItem bind:group={selectedTopic} name={topic} value={topic}>
						{topic}
					</ListBoxItem>
				{/each}
			</ListBox>
		</Step>
	</Stepper>
</div>
