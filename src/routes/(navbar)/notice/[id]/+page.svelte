<script lang="ts">
    import { common_fetch } from "$lib/fetch_func";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { priv_key } from "$lib/stores";
    import { get } from "svelte/store";
    import { Modal, initModals } from "flowbite";
    import {FileObj} from "$lib/containers";
    import FileCard from "$lib/components/team/file-card.svelte";

    let id: string;
    let sender: string = "Ekjon Sender";
    let subject: string = "Ekta kotha chilo";
    let content: string = "hehe";
    let creator_id:string = "";
    let file_id:string = "";
    let file:FileObj = new FileObj();
    //let content: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque pulvinar velit, quis consequat diam ullamcorper et. Integer ut blandit nibh, quis egestas tortor. Sed vitae consequat ipsum. Phasellus imperdiet cursus rutrum. Etiam venenatis at nisi a fringilla. Aenean rhoncus hendrerit arcu, a vestibulum leo porttitor vitae. Duis nec augue eros. Proin sit amet sapien fermentum, faucibus lectus et, ultrices quam. Ut pharetra pellentesque lectus, sit amet sagittis turpis fermentum vel. Donec volutpat ullamcorper pretium. Suspendisse eleifend imperdiet malesuada. Fusce nec orci nisi. In eu dignissim dolor, at elementum elit. Aenean eros leo, mollis a neque eu, fringilla volutpat odio. Duis imperdiet erat sit amet diam aliquet porttitor. In non lorem vel purus mollis vehicula. Donec volutpat nunc eget tempus gravida. Aliquam diam tortor, tincidunt quis quam vitae, varius tincidunt odio. Pellentesque sed tellus eu mauris finibus semper in interdum nisi. Praesent eros sapien, fringilla mattis tincidunt pretium, lacinia euismod nunc. Mauris lorem nibh, facilisis nec hendrerit a, bibendum id nisi. Fusce sed massa efficitur, convallis magna ac, iaculis magna. Cras ante augue, dapibus ut dui ac, tristique faucibus neque. Aenean eget fermentum lectus. Donec facilisis tellus in ipsum porttitor suscipit at nec orci. Sed non quam sit amet risus porta lacinia eget sed lacus. Donec pharetra nunc dolor, ac accumsan risus tempus eget. Cras pharetra purus sit amet magna malesuada, vitae posuere orci pharetra. Proin faucibus augue in condimentum dapibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras a erat erat. Duis iaculis consequat dignissim. In sollicitudin rutrum velit, vel elementum lorem aliquam sit amet. Curabitur ac nulla ipsum. Integer laoreet maximus massa a tincidunt. Nunc vitae est dui. Phasellus a laoreet magna, eu ullamcorper massa. Etiam et elit non diam porttitor mattis. Vivamus imperdiet suscipit tellus, elementum porttitor felis egestas sit amet. Donec ut eros at ipsum dapibus eleifend id eget dolor. Quisque sed sagittis magna. Nulla et metus et nisl gravida luctus et vitae ipsum. Suspendisse ac massa ut enim vulputate consequat. Fusce luctus arcu quis malesuada ultricies. Aenean vitae risus vel dolor rhoncus consectetur. Aenean imperdiet enim non tempor convallis. Quisque maximus ac tortor eget tincidunt. Phasellus gravida non lorem eu sollicitudin. Aenean convallis leo varius risus accumsan, at auctor lectus aliquet. Praesent mattis elit et leo facilisis viverra. Praesent lorem augue, maximus sed imperdiet eget, consequat vitae lorem. Vivamus eget molestie mauris. Nam quis lacus eros. Sed et sapien in lectus pharetra dapibus quis quis quam. Cras efficitur iaculis erat. Phasellus vehicula metus urna, in molestie dolor aliquam eget. Cras nisl sapien, sodales vitae erat ut, euismod posuere neque. Integer varius scelerisque libero, nec molestie libero tristique et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque pulvinar velit, quis consequat diam ullamcorper et. Integer ut blandit nibh, quis egestas tortor. Sed vitae consequat ipsum. Phasellus imperdiet cursus rutrum. Etiam venenatis at nisi a fringilla. Aenean rhoncus hendrerit arcu, a vestibulum leo porttitor vitae. Duis nec augue eros. Proin sit amet sapien fermentum, faucibus lectus et, ultrices quam. Ut pharetra pellentesque lectus, sit amet sagittis turpis fermentum vel. Donec volutpat ullamcorper pretium. Suspendisse eleifend imperdiet malesuada. Fusce nec orci nisi. In eu dignissim dolor, at elementum elit. Aenean eros leo, mollis a neque eu, fringilla volutpat odio. Duis imperdiet erat sit amet diam aliquet porttitor. In non lorem vel purus mollis vehicula. Donec volutpat nunc eget tempus gravida. Aliquam diam tortor, tincidunt quis quam vitae, varius tincidunt odio. Pellentesque sed tellus eu mauris finibus semper in interdum nisi. Praesent eros sapien, fringilla mattis tincidunt pretium, lacinia euismod nunc. Mauris lorem nibh, facilisis nec hendrerit a, bibendum id nisi. Fusce sed massa efficitur, convallis magna ac, iaculis magna. Cras ante augue, dapibus ut dui ac, tristique faucibus neque. Aenean eget fermentum lectus. Donec facilisis tellus in ipsum porttitor suscipit at nec orci. Sed non quam sit amet risus porta lacinia eget sed lacus. Donec pharetra nunc dolor, ac accumsan risus tempus eget. Cras pharetra purus sit amet magna malesuada, vitae posuere orci pharetra. Proin faucibus augue in condimentum dapibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras a erat erat. Duis iaculis consequat dignissim. In sollicitudin rutrum velit, vel elementum lorem aliquam sit amet. Curabitur ac nulla ipsum. Integer laoreet maximus massa a tincidunt. Nunc vitae est dui. Phasellus a laoreet magna, eu ullamcorper massa. Etiam et elit non diam porttitor mattis. Vivamus imperdiet suscipit tellus, elementum porttitor felis egestas sit amet. Donec ut eros at ipsum dapibus eleifend id eget dolor. Quisque sed sagittis magna. Nulla et metus et nisl gravida luctus et vitae ipsum. Suspendisse ac massa ut enim vulputate consequat. Fusce luctus arcu quis malesuada ultricies. Aenean vitae risus vel dolor rhoncus consectetur. Aenean imperdiet enim non tempor convallis. Quisque maximus ac tortor eget tincidunt. Phasellus gravida non lorem eu sollicitudin. Aenean convallis leo varius risus accumsan, at auctor lectus aliquet. Praesent mattis elit et leo facilisis viverra. Praesent lorem augue, maximus sed imperdiet eget, consequat vitae lorem. Vivamus eget molestie mauris. Nam quis lacus eros. Sed et sapien in lectus pharetra dapibus quis quis quam. Cras efficitur iaculis erat. Phasellus vehicula metus urna, in molestie dolor aliquam eget. Cras nisl sapien, sodales vitae erat ut, euismod posuere neque. Integer varius scelerisque libero, nec molestie libero tristique et.";

    async function get_notice_details(): Promise<void>
    {
        let request_obj: any = {
            noticeid: id,
        };

        common_fetch(
        "/api/notice/getdetails",
        request_obj,
        async (response: Response): Promise<void> => {
            let response_obj: any = await response.json();

            if (response_obj === null) {
            return;
            }
            console.log(response_obj)
            content = response_obj.f_content;
            subject =response_obj.f_subject;
            sender =response_obj.f_creator_name;
            creator_id = response_obj.f_creator_id;
            file_id = response_obj.f_related_file_id;
            if(file_id!=null)
        {
            get_file_details();
        }
        });
    }
    async function get_file_details(): Promise<void>
    {
        let request_obj: any = {
            fileid: file_id,
        };

        common_fetch(
        "/api/files/getfiledetail",
        request_obj,
        async (response: Response): Promise<void> => {
            let response_obj: any = await response.json();

            if (response_obj === null) {
            return;
            }
            console.log(response_obj)
            file = new FileObj();
            file.id=response_obj.result1.fileid;
            file.name=response_obj.result1.filename;
            file.type=response_obj.result1.file_extension;
            console.log(file);
        });
    }
    

   let file_uploading_modal_elem: HTMLDivElement;
   let file_upload_progress: HTMLDivElement;
   let file_uploading_modal: Modal;

   function add_file(): void {
    let file_input_elem: HTMLInputElement = document.createElement("input");
    file_input_elem.type = "file";

    file_input_elem.onchange = async (event: Event): Promise<void> => {
      file_uploading_modal.show();

      let file: File | null | undefined = file_input_elem.files?.item(0);

      if (file === null || file === undefined) {
        return;
      }

      let file_buffer: ArrayBuffer = await file.arrayBuffer();
      let success: boolean = true;
      let file_success_response_obj: any = {};

      for (let i: number = 0; i < file_buffer.byteLength; i += 1048576) {
        file_upload_progress.style.width =
          Math.round((i * 100) / file_buffer.byteLength) + "%";
        let smallbuffer: ArrayBuffer = file_buffer.slice(i, i + 1048576);
        let small_array: number[] = Array.from(new Uint8Array(smallbuffer));
        let response: Response = await fetch(
          "/api/notice/addnoticechunkfile/continue?filename=" + file.name,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: small_array,
            }),
          }
        );

        let response_obj: any = await response.json();

        //console.log(response_obj);

        if (response_obj.success === false) {
          //console.error("dhuru");

          success = false;

          break;
        }
      }

      if (success) {
        file_upload_progress.style.width = "100%";

        await fetch(
          "/api/notice/addnoticechunkfile/finish?filename=" +
            file.name +
            "&noticeid=" +
            id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        ).then(async (response: Response): Promise<void> => {
          file_success_response_obj = await response.json();

          file_uploading_modal.hide();
          
        });
        let subtle_crypto = window.crypto.subtle;
        let temp_priv_key = get(priv_key);

        if (temp_priv_key) {
          let signature: ArrayBuffer = await subtle_crypto.sign(
            {
              name: "ECDSA",
              hash: { name: "SHA-384" },
            },
            temp_priv_key,
            file_buffer
          );

          let signature_hex: string = [...new Uint8Array(signature)]
            .map((x) => x.toString(16).padStart(2, "0"))
            .join("");
          let pubkey_json: string | null = localStorage.getItem("pub_key");
          if (pubkey_json) {
            let request_obj: any = {
              fileid: file_success_response_obj.fileid,
              signature: signature_hex,
              key: pubkey_json,
              userid: $page.data.session?.user?.name,
            };

            common_fetch(
              "/api/files/addfilesignature",
              request_obj,
              async (response: Response): Promise<void> => {
                let response_obj: any = await response.json();

                console.log(response_obj);
              }
            );
          }
        }
      } else {
        file_uploading_modal.hide();
      }
    };

    file_input_elem.click();
  }


onMount((): void =>
    {
        initModals();
        file_uploading_modal = new Modal(file_uploading_modal_elem);
        id = $page.params.id;
        get_notice_details();


    });
</script>

<div class="notice-root">
    <div class="notice-root-card block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div class="notice-card-content">
            <p class="text-3xl font-bold text-gray-700 dark:text-gray-200">{subject}</p>
            <p class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Sent By: {sender}</p>
        </div>
        <div class="notice-message">
            <p class="text-gray-700 dark:text-gray-200 mb-4">{content}</p>
        </div>
        
        {#if file_id !== null }
         <FileCard file_id={file.id} file_name={file.name} file_type={file.type} file_status={file.status}/>
        {/if}
        <div class="flex justify-end mt-2">
            <button type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Done</button>
            <!-- Add File -->
            {#if creator_id == $page.data.session?.user?.name }
            {#if file_id == null}
                <button on:click={add_file} type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add File</button>
                {/if}
                {/if}
            </div>
    </div>
</div>
<div
  bind:this={file_uploading_modal_elem}
  data-modal-backdrop="static"
  tabindex="-1"
  aria-hidden="true"
  class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
>
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <div
        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Uploading...
        </h3>
      </div>
      <div class="p-4 md:p-5 space-y-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            bind:this={file_upload_progress}
            class="bg-blue-600 h-2.5 rounded-full"
            style="width: 0%"
          ></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
    .notice-root
    {
        position: absolute;
        top: 5.25rem;
        bottom: 1rem;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .notice-root-card
    {
        position: absolute;
        width: 65rem;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .notice-message
    {
        flex-grow: 1;
        overflow-y: auto;
    }
    @media(max-width: 1099px)
    {
        .notice-root
        {
            margin-left: 1rem;
            margin-right: 1rem;
        }
        .notice-root-card
        {
            width: 100%;
        }
    }
</style>