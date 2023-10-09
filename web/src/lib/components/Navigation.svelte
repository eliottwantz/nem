<script lang="ts">
    import { page } from "$app/stores"
    import { getDrawerStore } from "@skeletonlabs/skeleton"
    import { t } from "svelte-i18n"
    const drawerStore = getDrawerStore()

    export let horizontal: boolean = true;

    $: activeUrl = $page.url.pathname;
</script>

<nav class="select-none text-lg {horizontal ? '' : 'list-nav'}">
    <ul class={horizontal ? "flex items-center justify-center space-x-8" : "space-y-4"}>
        <li>
            <a
                href="/"
                class="flex"
                class:active={activeUrl === "/" && !horizontal}
                on:click={() => drawerStore.close()}
            >
                {$t("nav.home")}
            </a>
        </li>
        <li>
            <a
                href="/about"
                class="flex"
                class:active={activeUrl === "/about" && !horizontal}
                on:click={() => drawerStore.close()}
            >
                {$t("nav.about")}
            </a>
        </li>
        <li>
            <a
                href="/contact"
                class="flex"
                class:active={activeUrl === "/contact" && !horizontal}
                on:click={() => drawerStore.close()}
            >
                {$t("nav.contact")}
            </a>
        </li>
    </ul>
</nav>

<style lang="postcss">
    a {
        color: black;
    }

    .active {
        @apply bg-primary-active-token;
    }
</style>
