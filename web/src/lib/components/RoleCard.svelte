<script lang="ts">
    export let title: string
    export let desc: string
    export let selected: boolean = false
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button
    class="card p-2 space-y-4 shadow-xl max-w-md bg-gradient-to-b from-secondary-500 to-secondary-700 hover:cursor-pointer hover:scale-105 transition-transform border-4 {selected
        ? 'border-primary-400'
        : 'border-surface-500/40'}"
    on:click
>
    <div class="flex items-center justify-center">
        <slot />
        <p class="h3">{title}</p>
    </div>
    <p class="text-center break-before-right">{desc}</p>
</button>
