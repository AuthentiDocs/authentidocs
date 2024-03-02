<script lang="ts">
    import { onMount } from "svelte";

    export let thread_name: string;
    export let thread_id:string;
    const all_colors: string[] = ["red", "green", "blue", "purple"];
    let color: string;

    onMount(() : void =>
    {
        color = all_colors[Math.round(Math.random() * (all_colors.length - 1))];
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="thread/{thread_id}" class="block p-6 bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
    <div class="flex">
        <svg class="w-8 h-8 text-{color}-500 dark:text-{color}-400 pe-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
        </svg>
        <div class="flex-grow">
            <p class="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                {thread_name}
            </p>
        </div>
    </div>                  
</a>