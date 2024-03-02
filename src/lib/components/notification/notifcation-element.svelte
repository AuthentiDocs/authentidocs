<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { update_thread } from "$lib/stores";

    export let id: string;
    export let content: string;
    export let seen: boolean;
    export let level_id: string;
    export let level:string;

    function goto_thread(): void
    {
        $update_thread = true;
        goto("/"+level+"/" + level_id);
    }

    function read(): void
    {
        fetch("/api/user/readnotifications",
        {
            method: "POST",
            headers:
            {
                "content-type": "application/json"
            },
            body: JSON.stringify(
            {
                user_id: $page.data.session?.user?.name,
                notificationid: id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            seen = true;
        });
    }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="flex items-center justify-between space-x-4 rtl:space-x-reverse">
    <a on:click={goto_thread} href="javascript:" class="text-sm font-medium text-gray-700 truncate dark:text-white">
        {content}
    </a>
    <button on:click={read} type="button" class="py-2 px-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" disabled={seen}>
        <svg class="w-4 h-4 text-green-600 dark:text-green-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
    </button>
</div>