<script lang="ts">
    import { Modal, initModals } from "flowbite";
    import { onMount } from "svelte";

    export let id: string;
    export let modal: Modal;
    export let creation_request: (id: string, name: string, description: string) => any;
    let name: string;
    let description: string;
    let modal_elem: HTMLDivElement;

    function create(): void
    {
        creation_request(id, name, description);
    }

    onMount((): void =>
    {
        modal = new Modal(modal_elem);
    });
</script>

<div bind:this={modal_elem} data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Create
                </h3>
                <button on:click={() => {modal.hide();}} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="p-4 md:p-5 space-y-4">
                <form on:submit={create} action="javascript:">
                    <div class="mb-4">
                        <label for="notice-subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input bind:value={name} type="text" id="notice-subject" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" autocomplete="off" required />
                    </div>
                    <div class="mb-4">
                        <label for="notice-content" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <textarea bind:value={description} id="notice-content" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" autocomplete="off" required></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>