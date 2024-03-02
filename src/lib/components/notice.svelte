<script lang="ts">
    import { gen_random_color } from "$lib/helpers";
    import { onMount } from "svelte";

    export let uid: string;
    export let title: string;

    let color: string;

    onMount(() : void =>
    {
        color = gen_random_color();
    });
</script>

<a href="/notice/{uid}" class="flex block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
    <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400 pe-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13V8m0 8h0m9-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
    <p class="text-2xl font-semibold text-gray-700 dark:text-gray-200">{title}</p>
</a>    