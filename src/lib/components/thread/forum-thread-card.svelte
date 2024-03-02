<script lang="ts">
    import { ForumThread } from "$lib/containers";
    import { gen_random_color } from "$lib/helpers";
    import { onMount } from "svelte";
    export let forum_thread: ForumThread;
    export let select_thread: (forum_thread: ForumThread) => void;
    let color: string;

    onMount(() : void =>
    {
        color = gen_random_color();
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<button on:click={() => select_thread(forum_thread)} class="block p-6 bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 w-full">
    <div class="flex items-center">
        <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9h5m3 0h2M7 12h2m3 0h5M5 5h14c.6 0 1 .4 1 1v9c0 .6-.4 1-1 1h-6.6a1 1 0 0 0-.7.3l-2.9 2.5c-.3.3-.8.1-.8-.3V17c0-.6-.4-1-1-1H5a1 1 0 0 1-1-1V6c0-.6.4-1 1-1Z"/>
        </svg>
        <p class="text-2xl font-semibold text-gray-700 dark:text-white">{forum_thread.name}</p>
    </div>
</button>