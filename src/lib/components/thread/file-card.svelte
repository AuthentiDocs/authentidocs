<script lang="ts">
	import { file_preview_mode } from "$lib/stores";
    import { gen_random_color } from "$lib/helpers";
    import { onMount } from "svelte";

    export let file_id: string;
    export let file_name: string;
    export let file_type: string;
    export let file_status: string;
    let color: string;
    let file_status_color: string;
    let file_status_text: string;

    onMount(() : void =>
    {
        file_preview_mode.set(1);
        color = gen_random_color();

        if(file_status === "not_viewed_by_custodian")
        {
            file_status_color = "red";
            file_status_text = "Not Viewed and Not Signed";
        }
        else if(file_status === "viewed_by_custodian")
        {
            file_status_color = "blue";
            file_status_text = "Viewed and Not Signed";
        }
        else if(file_status === "signed_viewed_by_custodian" || file_status === "personal")
        {
            file_status_color = "green";
            file_status_text = "Viewed and Signed";
        }
        else if(file_status === "3")
        {
            file_status_color = "yellow";
            file_status_text = "Not in Custody";
        }
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="/preview/{file_id}" class="block p-6 bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
    <div class="flex">
        <div class="pe-2">
            {#if file_type === "png" || file_type === "bmp" || file_type === "tiff" || file_type === "jpg" || file_type === "jpeg" || file_type === "webp"}
                <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 18H8l2.5-6 2 4 1.5-2 2 4Zm-1-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 3v4c0 .6-.4 1-1 1H5m14-4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1ZM8 18h8l-2-4-1.5 2-2-4L8 18Zm7-8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                </svg>
            {:else if file_type === "pdf"}
                <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 17v-5h1.5a1.5 1.5 0 1 1 0 3H5m12 2v-5h2m-2 3h2M5 10V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1v6M5 19v1c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-1M10 3v4c0 .6-.4 1-1 1H5m6 4v5h1.4a1.6 1.6 0 0 0 1.6-1.6v-1.8a1.6 1.6 0 0 0-1.6-1.6H11Z"/>
                </svg>
            {:else}
                <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M10 3v4c0 .6-.4 1-1 1H5m14-4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1Z"/>
                </svg>       
            {/if}
        </div>
        <div class="flex-grow">
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {file_name}
            </p>
            <p class="text-base text-gray-500 dark:text-gray-400">
                {file_type.toUpperCase()}
            </p>
        </div>
        <div class="flex flex-row-reverse items-end">
            <p class="text-base text-{file_status_color}-500 dark:text-{file_status_color}-400">
                {file_status_text}
            </p>
        </div>
    </div>                  
</a>