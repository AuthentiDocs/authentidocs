<script lang="ts">
    import { gen_random_color } from "$lib/helpers";
    import { onMount } from "svelte";

    export let id: string;
    export let name: string;
    let color: string;

    onMount(() : void =>
    {
        color = gen_random_color();
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="/thread/{id}" class="block p-6 bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
    <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-paperclip w-7 h-7 text-{color}-500 dark:text-{color}-400" viewBox="0 0 16 16">
            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
        </svg>
        <p class="text-2xl font-semibold text-gray-700 dark:text-white">{name}</p>
    </div>
</a>