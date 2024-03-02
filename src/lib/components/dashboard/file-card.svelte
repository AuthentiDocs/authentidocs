<script lang="ts">
    import { gen_random_color } from "$lib/helpers";
    import { onMount } from "svelte";
    import { file_preview_mode } from "$lib/stores";

    export let file_id: string;
    export let file_name: string;
    export let file_type: string;
    let color: string;

    onMount(() : void =>
    {
        file_preview_mode.set(4);
        color = gen_random_color();
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href={"/preview/" + file_id} class="block p-6 bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
    <div class="flex">
        <div class="pe-2">
            {#if file_type === "png" || file_type === "bmp" || file_type === "tiff" || file_type === "jpg" || file_type === "jpeg" || file_type === "webp"}
                <svg class="w-10 h-10 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 18H8l2.5-6 2 4 1.5-2 2 4Zm-1-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 3v4c0 .6-.4 1-1 1H5m14-4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1ZM8 18h8l-2-4-1.5 2-2-4L8 18Zm7-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                </svg>
            {:else if file_type === "pdf"}
                <svg class="w-10 h-10 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17v-5h1.5a1.5 1.5 0 1 1 0 3H5m12 2v-5h2m-2 3h2M5 10V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1v6M5 19v1c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-1M10 3v4c0 .6-.4 1-1 1H5m6 4v5h1.4a1.6 1.6 0 0 0 1.6-1.6v-1.8a1.6 1.6 0 0 0-1.6-1.6H11Z"/>
                </svg>
            {:else}
                <svg class="w-10 h-10 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M10 3v4c0 .6-.4 1-1 1H5m14-4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1Z"/>
                </svg>       
            {/if}
        </div>
        <div class="flex-grow">
            <p class="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                {file_name}
            </p>
            <p class="text-base text-gray-500 dark:text-gray-400">
                {file_type.toUpperCase()}
            </p>
        </div>
    </div>                  
</a>