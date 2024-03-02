<script lang="ts">
    import { page } from "$app/stores";
    import { initDropdowns } from "flowbite";
    import { onMount } from "svelte";
    import NotifcatinElement from "./notifcation-element.svelte";
    import { notifications } from "$lib/stores";
    import { get_notifications } from "$lib/notification";

    let available: boolean;

    $: available = $notifications.length > 0;

    onMount((): void =>
    {
        initDropdowns();

        get_notifications($page.data.session?.user?.name);
    });
  
    async function read_all()
    {
        fetch("/api/user/readallnotifications",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                user_id: $page.data.session?.user?.name
            })
        }).then(async (response: Response): Promise<void> =>
        {
            $notifications = [];
        });
    }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<button id="notification-button" data-dropdown-toggle="notification-dropdown" class="py-2 px-2 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-gray-200 dark:hover:bg-gray-700 me-2">
    {#if available}
        <svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5.4V3m0 2.4a5.3 5.3 0 0 1 5.1 5.3v1.8c0 2.4 1.9 3 1.9 4.2 0 .6 0 1.2-.5 1.2h-13c-.5 0-.5-.6-.5-1.2 0-1.2 1.9-1.8 1.9-4.2v-1.8A5.3 5.3 0 0 1 12 5.4Zm-8.1 5.3c0-2 .8-4.1 2.2-5.7m14 5.7c0-2-.8-4.1-2.2-5.7M8.5 18a3.5 3.5 0 0 0 7 0h-7Z"/>
        </svg>
    {:else}
        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5.4V3m0 2.4a5.3 5.3 0 0 1 5.1 5.3v1.8c0 2.4 1.9 3 1.9 4.2 0 .6 0 1.3-.5 1.3h-13c-.5 0-.5-.7-.5-1.3 0-1.2 1.9-1.8 1.9-4.2v-1.8A5.3 5.3 0 0 1 12 5.4ZM8.7 18c.1.9.3 1.5 1 2.1a3.5 3.5 0 0 0 4.6 0c.7-.6 1.3-1.2 1.4-2.1h-7Z"/>
        </svg>
    {/if}
</button>

<!-- Dropdown menu -->
<div id="notification-dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-96 overflow-y-auto dark:bg-gray-700" style="max-height: 75%;">
    <p class="text-2xl font-semibold text-gray-700 truncate dark:text-white my-2 mx-4">Notifications</p>
    <ul class="max-w-md divide-y divide-gray-200 dark:divide-gray-700 my-2 mx-4">
        {#each $notifications as notification}
            <li class="py-3 sm:py-4">
                <NotifcatinElement level={notification.level} level_id={notification.level_id} id={notification.id} content={notification.content} seen={notification.seen} />
            </li>
        {/each}
    </ul>
    {#if available}
        <div class="flex justify-end">
            <!-- svelte-ignore a11y-invalid-attribute -->

            <a on:click={read_all} href="javascript:" class="font-medium text-blue-600 dark:text-blue-500 hover:underline my-2 mx-4">Mark All Read</a>

        </div>
    {/if}
</div>