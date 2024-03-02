<script lang="ts">
    import { gen_random_color } from "$lib/helpers";
    import { onMount } from "svelte";

    export let uid: string;
    export let name: string;
    export let selected: boolean = false;
    let color: string;
    let bg_color_class: string;

    onMount(() : void =>
    {
        if(selected)
        {
            bg_color_class = "bg-gray-200 dark:bg-gray-600";
        }
        else
        {
            bg_color_class = "bg-white dark:bg-gray-800";
        }

        color = gen_random_color();
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="/team/{uid}" class="block p-6 {bg_color_class} hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
    <div class="flex items-center">
        <svg class="w-6 h-6 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
        </svg>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-200">{name}</p>
    </div>
</a>