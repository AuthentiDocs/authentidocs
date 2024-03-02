<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { common_fetch } from "$lib/fetch_func";
    import { Modal, initModals } from "flowbite";
    import { onMount } from "svelte";
    import { logged_in_store, priv_key, uid, useremail,file_preview_mode } from "$lib/stores";
    import { jsPDF } from "jspdf";
    import { get } from "svelte/store";
    import { make_date, make_time } from "$lib/helpers";

    class Signature
    {
        public by: string = "";
        public on_date: string = "";
        public on_time: string = "";
        public signature: string = "";
        public pubkey: string = "";
    };

    class Note
    {
        public author: string = "";
        public date: string = "";
        public time: string = "";
        public content: string = "";
    }

    class History
    {
        public custodian: string = "";
        public date: string = "";
        public time: string = "";
    }

    let id: string;
    let certificates: Signature[] = [];
    let notes: Note[] = [];
    let history: History[] = [];
    let file_name: string = "";
    let file_type: number = 0;
    let file_status: string = "personal";
    let download_anchor: HTMLAnchorElement;
    let file_view_link: string;
    let file_download_link: string;
    let file_loaded: boolean = false;

    let response_obj:any={};
    let username:string;
    let current_custody:string;
    let upload_timestamp: Date;
    let current_state:string;
    let upload_date:string;
    let upload_time:string;
    let add_note_text: string;
    let file_signed: boolean;
    let uploader:string;
    let ownerid:string;
    let current_custodianid:string;
    let viewer_custodian: boolean;
    let signable: boolean;
    let add_note_modal_elem: HTMLDivElement;
    let view_notes_modal_elem: HTMLDivElement;
    let history_modal_elem: HTMLDivElement;
    let add_note_modal: Modal;
    let view_notes_modal: Modal;
    let history_modal: Modal;

    $: file_signed = file_status === "signed_viewed_by_custodian";
    $: upload_date = make_date(upload_timestamp);
    $: upload_time = make_time(upload_timestamp);
    $: signable = viewer_custodian && !file_signed;

    function show_add_note_modal(): void
    {
        add_note_modal.show();
    }

    function hide_add_note_modal(): void
    {
        add_note_modal.hide();
    }

    async function add_note(): Promise<void>
    {
        let subtle_crypto: SubtleCrypto = window.crypto.subtle;
        let note_buffer: ArrayBuffer = new TextEncoder().encode(add_note_text).buffer;
        let temp_priv_key = get(priv_key);

        if (temp_priv_key) {
            let signature: ArrayBuffer = await subtle_crypto.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-384" },
            },
            temp_priv_key,
            note_buffer);

            let signature_hex: string = [...new Uint8Array(signature)].map((x) => x.toString(16).padStart(2, "0")).join("");
            let pubkey_json: string | null = localStorage.getItem("pub_key");

            if (pubkey_json) {
                let request_obj: any = {
                    fileid: $page.params.id,
                    content: add_note_text,
                    sign: signature_hex,
                    signing_key: pubkey_json,
                    given_signing_userid: $page.data.session?.user?.name
                };

                common_fetch(
                    "/api/thread/addfilenote",
                    request_obj,
                    async (response: Response): Promise<void> => {
                        let response_obj: any = await response.json();

                        add_note_text = "";

                        add_note_modal.hide();
                        init();
                    }
                );
            }
        }

        add_note_modal.hide();
    }

    function show_view_notes_modal(): void
    {
        view_notes_modal.show();
    }

    function hide_view_notes_modal(): void
    {
        view_notes_modal.hide();
    }

    function show_history_modal(): void
    {
        history_modal.show();
    }

    function hide_history_modal(): void
    {
        history_modal.hide();
    }

    function sign_file(): void
    {
        fetch(file_view_link,
        {
            method: "GET"
        }).then(async (response: Response): Promise<void> =>
        {
            let file_blob: Blob = await response.blob();
            let file_buffer: ArrayBuffer = await file_blob.arrayBuffer();
            let subtle_crypto: SubtleCrypto = window.crypto.subtle;
            let temp_priv_key = get(priv_key);

            if (temp_priv_key) {
                let signature: ArrayBuffer = await subtle_crypto.sign(
                {
                    name: "ECDSA",
                    hash: { name: "SHA-384" },
                },
                temp_priv_key,
                file_buffer);

                let signature_hex: string = [...new Uint8Array(signature)].map((x) => x.toString(16).padStart(2, "0")).join("");
                let pubkey_json: string | null = localStorage.getItem("pub_key");

                if (pubkey_json) {
                    let request_obj: any = {
                        fileid: $page.params.id,
                        signature: signature_hex,
                        key: pubkey_json,
                        userid: $page.data.session?.user?.name,
                    };

                    common_fetch(
                        "/api/thread/addthreadfilesignature",
                        request_obj,
                        async (response: Response): Promise<void> => {
                            let response_obj: any = await response.json();

                            init();
                            console.log(response_obj);
                        }
                    );
                }
            }
        });
    }

    function init(): void
    {
        //console.log("file preview Mode: "+String($file_preview_mode));
        id = $page.params.id;

        initModals();

        file_loaded = false;
        add_note_modal = new Modal(add_note_modal_elem);
        view_notes_modal = new Modal(view_notes_modal_elem);
        history_modal = new Modal(history_modal_elem);

        if ($page.data.session === null) {
            goto("/");

            return;
        } else {
            logged_in_store.set(true);
            uid.set($page.data.session?.user?.name as string)
            useremail.set($page.data.session?.user?.email as string)
        }

        let request_obj: any =
        {
            fileid: $page.params.id,
            user_id: $page.data.session?.user?.name
        };

        common_fetch("/api/files/getfilelink", request_obj,
        async (response: Response): Promise<void> =>
        {
            response_obj = await response.json();
            file_name = response_obj.file_data.filename;
            file_type = response_obj.file_data.file_mimetype;
            file_status = response_obj.file_data.current_state;
            username=response_obj.file_data.username;
            ownerid=response_obj.file_data.file_ownerid;
            current_custodianid=response_obj.file_data.current_custodianid;

            viewer_custodian = current_custodianid === $page.data.session?.user?.name;

            upload_timestamp= new Date(response_obj.file_data.created_at);
            current_state=response_obj.file_data.current_state;

            let mime_text: string = "Application/octet-stream";

            if(file_type === 1)
            {
                mime_text = "image/*";
            }
            else if(file_type === 2)
            {
                mime_text = "Application/pdf";
            }
            
            file_view_link =response_obj.file_link_preview;
            file_download_link = response_obj.file_link_download;
            download_anchor.download = file_download_link;

            let name_response: Response = await fetch("/api/user/details",
            {
                method: "POST",
                headers:
                {
                    "content-type": "application/json"
                },
                body: JSON.stringify(
                {
                    userid: ownerid
                })
            });

            uploader = (await name_response.json()).username;
            name_response = await fetch("/api/user/details",
            {
                method: "POST",
                headers:
                {
                    "content-type": "application/json"
                },
                body: JSON.stringify(
                {
                    userid: current_custodianid
                })
            });

            current_custody = (await name_response.json()).username;

            file_loaded = true;
        });

        common_fetch("/api/files/getfilesigns", request_obj,
        async (response: Response): Promise<void> =>
        {
            let response_obj: any = await response.json();
            certificates = [];

            for(let i: number = 0; i < response_obj.length; ++i)
            {
                let new_certificate: Signature = new Signature();
                new_certificate.by = response_obj[i].f_signing_username;
                let on: Date = new Date(response_obj[i].f_created_at);
                new_certificate.on_date = on.toLocaleDateString();
                new_certificate.on_time = on.toLocaleTimeString();
                new_certificate.signature = response_obj[i].f_signature;
                new_certificate.pubkey = [...new Uint8Array(new TextEncoder().encode(JSON.stringify(response_obj[i].f_signing_key)))].map((x) => x.toString(16).padStart(2, "0")).join("");

                certificates.push(new_certificate);
            }
        });
        if($file_preview_mode == 1 )
        {
            common_fetch("/api/thread/getfilenotes",
        {
            fileid: id
        }, async (response: Response): Promise<void> =>
        {
            let response_obj: any = await response.json();
            console.log(response_obj);
            if(request_obj.length !=0)
            {
            notes = new Array(response_obj.length);

            for(let i: number = 0; i < notes.length; ++i)
            {
                notes[i] = new Note();
                notes[i].author = response_obj[i].f_username;
                let timestamp: Date = new Date(response_obj[i].f_created_at);
                notes[i].date = timestamp.toLocaleDateString();
                notes[i].time = timestamp.toLocaleTimeString();
                notes[i].content = response_obj[i].f_content;
            }
            }
            
        });
        common_fetch("/api/thread/getfilehistory",
        {
            fileid: id
        }, async (response: Response): Promise<void> =>
        {
            let response_obj: any = await response.json();
            if(response_obj.length!=0)
            {
                history = new Array(response_obj.length);
            for(let i: number = 0; i < history.length; ++i)
            {
                history[i] = new History();
                history[i].custodian = response_obj[i].f_username;
                let timestamp: Date = new Date(response_obj[i].f_start_at);
                history[i].date = timestamp.toLocaleDateString();
                history[i].time = timestamp.toLocaleTimeString();
            }
            }
           
        });
    }

        }
        

        

    onMount(async (): Promise<void> =>
    {
        init();
    });
    function generateCertificate() {
  // Create a new jsPDF object
  const doc = new jsPDF({ orientation: 'landscape' });


  // Add text content
  
  for (let i=0;i<certificates.length;i++)
  {

  // Add a background image (optional)
    doc.addImage('/certificate.jpg', 'JPEG', 0, 0, 297, 210);
    doc.text(String(i+1),275,10);
    doc.text('Certificate of File Signature', 100, 25); // Title
    doc.text("Signed By: "+certificates[i].by,25,50);
    doc.text("Signed On: "+certificates[i].on_date +" "+certificates[i].on_time,25,60);
    doc.text("Signature: ",25,70);
    let sign_parts = certificates[i].signature.match(/.{1,74}/g)
    if(sign_parts?.length)
    {
        for(let j=0;j<sign_parts.length;j++)
    {
        console.log(sign_parts)
        doc.text(sign_parts[j],52,70+j*10);
    }
    doc.text("Public Key:",25,70+sign_parts?.length*10);
    let key_parts = certificates[i].pubkey.match(/.{1,70}/g)
    if(key_parts?.length)
    {
        for(let j=0;j<key_parts.length;j++)
    {
        console.log(key_parts)
        doc.text(key_parts[j],55,70+sign_parts?.length*10+j*10);
    }   
    }
    }
    if(i!=certificates.length-1)
    {
        doc.addPage();
    }
  }

  // Save the PDF
   doc.save(file_name.split(".").reverse().pop()+"_certificate.pdf");
}
</script>

<svelte:head>
    <title>{file_name} preview</title> 
</svelte:head>

<div class="preview-root flex flex-col">
    <div class="preview-body flex-grow block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-2">
        {#if file_loaded}
            {#if file_type === 3}
                <div class="flex items-center" style="height: 100%;">
                    <div class="grow text-center p-4 mb-4 text-lg text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        No preview available
                    </div>
                </div>
                <!-- <img class="img-preview rounded" src={"/no_preview.jpg"} alt="No preview available for this file type." /> -->
            {:else if file_type === 1}
                <img class="img-preview rounded" src={file_view_link} alt="img-placeholder" />
            {:else if file_type === 2}
                <embed class="pdf-preview rounded" src={file_view_link} />
            {:else}
                <div class="flex flex-col justify-center" style="height: 100%;">
                    <div class="flex items-center justify-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <span class="sr-only">Info</span>
                        <div>
                            <p>No Preview Available T_T</p>
                        </div>
                    </div>
                </div>
            {/if}
        {:else}
            <div class="file-loader flex justify-center items-center">
                <div role="status">
                    <svg aria-hidden="true" class="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        {/if}
    </div>
    <div class="flex flex-col justify-between block p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        {#if file_loaded}
            <div class="meta-data">
                <p class="text-2xl font-medium text-gray-900 dark:text-white mb-2">{file_name}</p>
                <div class="grid grid-cols-5 gap-1 me-6">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Uploader</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Signed By</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Uploaded On</p>
                    </div>  
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Current Custody</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Current State</p>
                    </div>
                    <div class="flex items-center">
                        <img class="w-5 h-5 rounded-full me-2" src="/pochita.webp" alt="Rounded avatar">
                        <p class="text-xs font-medium text-gray-700 dark:text-white">{uploader}</p>
                    </div>
                    {#if $file_preview_mode == 1}
                    <div class="flex -space-x-2 rtl:space-x-reverse items-center">
                        <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                        <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                        <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a class="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800" href="javascript:">+69</a>
                    </div>
                    {:else}
                    <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                    {/if}
                    <div class="flex flex-col justify-center">
                        <p class="text-xs font-medium text-gray-700 dark:text-white">{upload_date}</p>
                        <p class="text-xs font-medium text-gray-700 dark:text-white">{upload_time}</p>
                    </div>
                    <div class="flex items-center">
                        {#if $file_preview_mode == 1}
                            <img class="w-5 h-5 rounded-full me-2" src="/pochita.webp" alt="Rounded avatar">
                            <p class="text-xs font-medium text-gray-700 dark:text-white">{current_custody}</p>
                        {:else}
                            <p class="text-xs font-medium text-gray-700 dark:text-white">N/A</p>
                        {/if}
                    </div>
                    <div class="flex items-center">
                        {#if $file_preview_mode == 1}
                            <p class="text-xs font-medium text-gray-700 dark:text-white">{current_state}</p>
                        {:else}
                            <p class="text-xs font-medium text-gray-700 dark:text-white">N/A</p>
                        {/if}
                    </div>
                </div>
            </div>
        {:else}
            <div class="meta-data">
                <div role="status" class="max-w-sm animate-pulse">
                    <div class="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-2"></div>
                </div>
                <div class="grid grid-cols-6 gap-1 animate-pulse me-6">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Uploader</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Signed By</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Uploaded On</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Current Custody</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Current State</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Current Work Thread</p>
                    </div>
                    <div class="flex items-center">
                        <img class="w-5 h-5 rounded-full me-2" src="/pochita.webp" alt="Rounded avatar">
                        <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
                    </div>
                    <div class="flex -space-x-2 rtl:space-x-reverse items-center">
                        <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                        <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                        <img class="w-5 h-5 border-2 border-white rounded-full dark:border-gray-800" src="/pochita.webp" alt="">
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a class="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800" href="javascript:">+69</a>
                    </div>
                    <div class="flex flex-col justify-center">
                        <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-20"></div>
                        <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
                    </div>
                    <div class="flex items-center">
                        <img class="w-5 h-5 rounded-full me-2" src="/pochita.webp" alt="Rounded avatar">
                        <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
                    </div>
                    <div class="flex items-center">
                        <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
                    </div>
                    <div class="flex items-center">
                        <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
                    </div>
                </div>
            </div>
        {/if}
        <div class="flex justify-end mt-3">
            {#if file_status !== "personal"}
                {#if file_status !== "closed"}
                
                    <!-- View Note -->
                    <button on:click={show_view_notes_modal} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2">View Notes</button>
                    <!-- Add Note -->
                    <button on:click={show_add_note_modal} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2" disabled={!signable}>Add Note</button>
                    <!-- Mark as Viewed -->
                    <button on:click={sign_file} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2" disabled={!signable}>Mark as Viewed</button>
                    <!-- File History -->
                    <button on:click={show_history_modal} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2">History</button>
                {/if}
            {/if}
            <!-- certificate button -->
            <button data-modal-target="cert-modal" data-modal-toggle="cert-modal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2">View Certificate</button>
            <!-- download button -->
            <a download={file_name} href={file_download_link} bind:this={download_anchor} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Download</a>
        </div>
    </div>
</div>

<div
  id="cert-modal"
  tabindex="-1"
  aria-hidden="true"
  class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
>
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <!-- Modal header -->
      <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          File Certificate
        </h3>
        <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="cert-modal">
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="p-4 md:p-5 space-y-4">
        {#each certificates as  certificate}
            <div class="w-full">
                <p class="text-base font-semibold text-gray-500 dark:text-gray-400">Signed By</p>
                <p class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{certificate.by}</p>
                <p class="text-base font-semibold text-gray-500 dark:text-gray-400">Signed On</p>
                <p class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <span>{certificate.on_date}</span>
                    <span>{certificate.on_time}</span>
                </p>
                <p class="text-base font-semibold text-gray-500 dark:text-gray-400">Signature</p>
                <div class="mb-2" style="max-width: 100%; overflow-x: auto">
                    <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">{certificate.signature}</p>
                </div>
                <p class="text-base font-semibold text-gray-500 dark:text-gray-400">Public Key</p>
                <div class="mb-2" style="max-width: 100%; overflow-x: auto">
                    <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">{certificate.pubkey}</p>
                </div>
            </div>
        {/each}
        <!-- download button -->
        <button on:click={generateCertificate} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Download</button>
      </div>
    </div>
  </div>
</div>

<div bind:this={history_modal_elem} tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <!-- Modal header -->
      <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Custody History
        </h3>
        <button on:click={hide_history_modal} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="p-4 md:p-5 space-y-4">
        <ol class="relative border-s border-gray-200 dark:border-gray-700">                  
            {#each history as elem}
                <li class="mb-10 ms-4">
                    <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                    <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        <span>{elem.date}</span>
                        <span>{elem.time}</span>
                    </time>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{elem.custodian}</h3>
                </li>
            {/each}
        </ol>
      </div>
    </div>
  </div>
</div>

<div bind:this={add_note_modal_elem} data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Add Note
                </h3>
                <button on:click={hide_add_note_modal} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="p-4 md:p-5 space-y-4">
                <form class="mx-auto">
                    <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>
                    <textarea bind:value={add_note_text} id="message" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a note..."></textarea>
                    <div class="flex justify-end">
                        <button on:click={add_note} type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<div bind:this={view_notes_modal_elem} data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Notes
                </h3>
                <button on:click={hide_view_notes_modal} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <div class="p-4 md:p-5 space-y-4">
                <ol class="relative border-s border-gray-200 dark:border-gray-700">                  
                    {#each notes as note}
                        <li class="mb-10 ms-4">
                            <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                <span>{note.date}</span>
                                <span>{note.time}</span>
                            </time>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{note.author}</h3>
                            <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{note.content}</p>
                        </li>
                    {/each}
                </ol>
            </div>
        </div>
    </div>
</div>

<style>
    .preview-root
    {
        position: absolute;
        top: 5.25rem;
        bottom: 1rem;
        left: 20%;
        right: 20%;
    }
    .preview-body
    {
        height: 70%;
    }
    .img-preview
    {
        height: 100%;
        margin-left: auto;
        margin-right: auto;
    }
    .pdf-preview
    {
        width: 100%;
        height: 100%;
    }
    .file-loader
    {
        height: 100%;
    }
</style>