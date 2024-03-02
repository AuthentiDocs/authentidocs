<script lang="ts">
    import { Navbar, NavBrand, NavLi, NavUl } from 'flowbite-svelte';
    import { username } from '../stores';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { common_fetch } from '$lib/fetch_func';
    import NotificationDropdown from "$lib/components/notification/notification-dropdown.svelte";
    import Pfp from './pfp.svelte';
    import { Modal } from 'flowbite';
    import SearchMode from './search-mode.svelte';
    import { afterNavigate, goto } from '$app/navigation';

    let search_mode: number;
    let search_query: string;
    let logged_in_state: boolean = false;
    let pubkey_value: string;
    let signature_value: string;
    let verify_modal_elem: HTMLDivElement;
    let verify_modal: Modal;
    let verify_result: number = 0;
    let verify_success_text: string = "File Verified";
    let verify_failure_text: string = "File Verification Failed";
    let verify_key_failure_text: string = "Invalid Key or Signature";
    let verified_username:string = "Unknown User";

    function search(): void
    {
        goto("/search?mode=" + search_mode + "&query=" + search_query);
    }

    function show_verify_modal(): void
    {
        verify_modal.show();
    }

    function hide_verify_modal(): void
    {
        verify_modal.hide();
    }

    function objectify_hash(hash: string, parse: boolean): any
    {
        let number_array: number[] = [];

        for(let i: number = 0; i < hash.length; i += 2)
        {
            let hex_str: string = hash.substring(i, i + 2);
            let byte_number: number = parseInt(hex_str, 16);

            number_array.push(byte_number);
        }

        let uint8_array: Uint8Array = new Uint8Array(number_array);

        if(parse)
        {
            let json: string = new TextDecoder().decode(uint8_array);
            return JSON.parse(JSON.parse(json));
        }
        else
        {
            return uint8_array.buffer;
        }
    }
    function check_key_validity(hash: string): any
    {
        let number_array: number[] = [];

        for(let i: number = 0; i < hash.length; i += 2)
        {
            let hex_str: string = hash.substring(i, i + 2);
            let byte_number: number = parseInt(hex_str, 16);

            number_array.push(byte_number);
        }

        let uint8_array: Uint8Array = new Uint8Array(number_array);

        let json: string = new TextDecoder().decode(uint8_array);
        let temp_json;
        try {
            temp_json = JSON.parse(json);
            return true;
        } catch (error) {
            return false;
        }
    }

    function upload(): void
    {
        let input_elem: HTMLInputElement = document.createElement("input");
        input_elem.type = "file";
        input_elem.onchange = async (ev: Event): Promise<void> =>
        {
            if(!check_key_validity(pubkey_value))
            {
                console.log("Error e dhuklam")
                verify_result=2;
                return;
            }
            let pubkey_jwk: JsonWebKey = objectify_hash(pubkey_value, true) as JsonWebKey;
            let pubkey: CryptoKey = await window.crypto.subtle.importKey("jwk", pubkey_jwk,
            {
                name: "ECDSA",
                namedCurve: "P-384",
            }, true, ["verify"]);
            let signature: ArrayBuffer = objectify_hash(signature_value, false);
            let files: FileList | null = input_elem.files;

            if(files === null)
            {
                return;
            }

            let file: File | null = files[0];

            if(file === null)
            {
                return;
            }

            let file_buffer: ArrayBuffer = await file.arrayBuffer();
            let result = await window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: { name: "SHA-384" },
            }, pubkey, signature, file_buffer);

            if(result === true)
            {

                verify_result = 1;
                let pub_key=objectify_hash(pubkey_value, true)
                let request_obj: any = {
                key: JSON.stringify(pub_key),
                };

                common_fetch(
                "/api/user/verifykey",
                request_obj,
                async (response: Response): Promise<void> => {
                    let response_obj: any = await response.json();

                    if (response_obj === null) {
                    return;
                    }
                    console.log(response_obj);
                    verified_username = response_obj.username;
                    
                }
                );
            }
            else
            {
                verify_result = 3;
            }
        }

        input_elem.click();
    }

    afterNavigate((): void =>
    {
        let temp_mode: string | null = $page.url.searchParams.get("mode");
        let temp_query: string | null = $page.url.searchParams.get("query");

        if(temp_mode !== null && temp_query !== null)
        {
            search_mode = parseInt(temp_mode);
            search_query = temp_query;
        }
    });

    onMount((): void =>
    {
        verify_modal = new Modal(verify_modal_elem);

        if($page.data.session)
        {
            logged_in_state = true;
            
            let request_obj: any = {
                userid: $page.data.session?.user?.name,
              };

                common_fetch(
                "/api/user/details",
                request_obj,
                async (response: Response): Promise<void> => {
                  let response_obj: any = await response.json();
                  username.set(response_obj.username)
                  //console.log(response_obj);

                }
              );
        }
        else
        {
            logged_in_state = false;
        }
    });
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Navbar fluid={false}>
    <NavBrand href="/">
        <img src="/logo.webp" class="rounded-lg me-3 h-6 sm:h-9" alt="App Logo" /> <!-- apatoto -->
        <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Authentidocs</span>
    </NavBrand>
    <div class="items-center">
        <form on:submit={search} action="javascript:" class="flex mx-auto">
            <SearchMode bind:mode={search_mode} />
            <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative w-96">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input bind:value={search_query} type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 rounded-s-none border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search..." required />
                <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
            </div>
        </form>
    </div>
    <div class="flex items-center">
        <a on:click={show_verify_modal} href="javascript:" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent my-auto me-2">Upload & Verify</a>
        {#if logged_in_state}
            <div class="flex items-center md:order-2">
                <NotificationDropdown />
                <Pfp />
            </div>
        {:else}
            <div class="flex">
                <a href="/signup" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2">Sign Up</a>
                <a href="/login" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Login</a>
            </div>
        {/if}
    </div>
</Navbar>

<div bind:this={verify_modal_elem} data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Upload & Verify
                </h3>
                <button on:click={hide_verify_modal} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="p-4 md:p-5 space-y-4">
                <form on:submit={upload} class="mx-auto">
                    <div class="mb-4">
                      <label for="public-key" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Public Key</label>
                      <textarea bind:value={pubkey_value} id="public-key" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" autocomplete="off"></textarea>
                    </div>
                    <div class="mb-4">
                        <label for="signature" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Signature</label>
                        <textarea bind:value={signature_value} id="signature" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" autocomplete="off"></textarea>
                    </div>
                    {#if verify_result === 0}
                        <div></div>
                    {:else if verify_result === 1}
                        <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                            {verify_success_text}
                            Signed By : {verified_username}
                        </div>
                    {:else if verify_result === 2}
                        <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            {verify_key_failure_text}
                        </div>
                    {:else}
                        <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            {verify_failure_text}
                        </div>
                    {/if}
                    <div class="flex justify-end">
                        <button type="submit" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>