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
<a href="/org/{uid}" class="block p-6 {bg_color_class} hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
    <div class="flex items-center">
        <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h0"/>
        </svg>
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-200">{name}</p>
    </div>
</a>