<script lang="ts">
    import { initDropdowns } from "flowbite";
    import { onMount } from "svelte";
    import { uid, useremail, username } from "$lib/stores";
    import { db } from "$lib/db";
    import { get } from "svelte/store";
    import { signOut } from "@auth/sveltekit/client";

    async function logout(): Promise<void>
    {
        await db.priv_key.delete(get(uid));
        await db.delete();

        signOut({callbackUrl: "/"});
    }

    onMount((): void =>
    {
        initDropdowns();
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:" data-dropdown-toggle="pfp-dropdown" class="text-white font-medium rounded-lg text-sm text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
    <img class="w-10 h-10 rounded-full" src="/pochita.webp" alt="Rounded avatar">
</a>

<div id="pfp-dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
    <div class="px-4 py-3 text-sm text-gray-900 dark:text-white">
        <p class="text-xl font-semibold truncate text-gray-700 dark:text=gray-200">{$username}</p>
        <p class="font-medium truncate text-gray-700 dark:text=gray-200">{$useremail}</p>
    </div>
    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
      <li>
        <a href="/dashboard" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
      </li>
      <li>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a on:click={logout} href="javascript:" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Logout</a>
      </li>
    </ul>
</div>