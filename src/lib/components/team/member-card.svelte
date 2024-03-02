<script lang="ts">
    import { initModals } from "flowbite";
    import { onMount } from "svelte";

    export let id: string;
    export let name: string;
    export let type: string;
    export let joined_at: Date;
    export let pub_key: String;
    let date_text:String;
    let pubkey: string = "0499cb82c6ebb2ae7d2bffb6071fa0499cb82c6ebb2ae7d2bffb6071fa0499cb82c6ebb2ae7d2bffb6071fa";
    let pubkey_truncate_status: string = "truncate";
    let pubkey_p: HTMLParagraphElement;
    function switch_pubkey_truncate(): void {
    if (pubkey_truncate_status === "truncate") {
      pubkey_truncate_status = "";
    } else {
      pubkey_truncate_status = "truncate";
    }
  }
  export let team_id:string;
  export let is_admin:boolean =false;
  async function make_moderator(): Promise<void> {
    let response: Response = await fetch(
                    "/api/team/makeadmin",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            teamid:team_id,
                            id:id,
                        })
                    }
                );
                let response_obj: any = await response.json();

    
  }
    onMount((): void =>
    {
        initModals();
        date_text = joined_at.toLocaleDateString();
        pubkey = [
          ...new Uint8Array(
            new TextEncoder().encode(JSON.stringify(pub_key))
          ),
        ]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
    })
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<button data-modal-target="member-modal-{id}" data-modal-toggle="member-modal-{id}" class="block text-start flex space-x-2 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" style="width: 100%;">
    <img class="w-10 h-10 rounded-full" src="/pochita.webp" alt="Rounded avatar">
    <div class="grow">
        <p class="text-2xl font-semibold text-gray-700 dark:text-gray-200">{name}</p>
        <div class="flex justify-between items-end">
            <p class="text-base font-semibold text-blue-500 dark:text-blue-400 me-2">{type}</p>
        </div>
    </div>
</button>

<div id="member-modal-{id}" data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal body -->
            <div class="p-4 md:p-5 space-y-4">
                <div class="flex justify-end">
                    <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="member-modal-{id}">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <div class="flex flex-col items-center">
                    <img class="w-24 h-24 rounded-full mb-4" src="/pochita.webp" alt="Rounded avatar">
                    <p class="text-2xl font-semibold text-gray-700">{name}</p>
                    <p class="text-xl font-medium text-gray-500">{type}</p>
                    <p class="text-lg font-medium text-gray-500">Added on: {date_text}</p>
                </div>
                <p class="text-base font-medium text-gray-500 dark:text-gray-400 mt-6">
                    Public Key:
                  </p>
                  <div class="flex items-start mb-2" style="max-width: 100%;">
                    <p
                      class="text-xl font-medium text-gray-700 dark:text-gray-200 {pubkey_truncate_status} mt-auto mb-auto"
                      style="width: 80%; word-wrap: break-word;"
                      bind:this={pubkey_p}
                    >
                      {pubkey}
                    </p>
                    <!-- Show/hide public key button -->
                    <button
                      type="button"
                      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ms-2"
                      on:click={switch_pubkey_truncate}
                    >
                      {#if pubkey_truncate_status === "truncate"}
                        <svg
                          class="w-3 h-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 14"
                        >
                          <path
                            d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
                          />
                        </svg>
                      {:else}
                        <svg
                          class="w-3 h-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="m2 13.587 3.055-3.055A4.913 4.913 0 0 1 5 10a5.006 5.006 0 0 1 5-5c.178.008.356.026.532.054l1.744-1.744A8.973 8.973 0 0 0 10 3C4.612 3 0 8.336 0 10a6.49 6.49 0 0 0 2 3.587Z"
                          />
                          <path
                            d="m12.7 8.714 6.007-6.007a1 1 0 1 0-1.414-1.414L11.286 7.3a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.401.211.59l-6.007 6.007a1 1 0 1 0 1.414 1.414L8.714 12.7c.189.091.386.162.59.211.011 0 .021.007.033.01a2.981 2.981 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z"
                          />
                          <path
                            d="M17.821 6.593 14.964 9.45a4.952 4.952 0 0 1-5.514 5.514L7.665 16.75c.767.165 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z"
                          />
                        </svg>
                      {/if}
                    </button>
                </div>
                <div class="flex justify-end">
                    <button on:click={make_moderator} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" disabled={!is_admin}>Make Moderator</button>
                    <button type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" disabled={!is_admin}>Remove</button>
                </div>
            </div>
        </div>
    </div>
</div>