<script lang="ts">
  import { common_fetch } from "$lib/fetch_func";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { logged_in_store, priv_key } from "$lib/stores";
  import { get } from "svelte/store";
  import { Modal, initModals } from "flowbite";
  import { FileObj } from "$lib/containers";
  import FileCard from "$lib/components/team/file-card.svelte";
  import { fade } from "svelte/transition";
  import { make_date, make_time } from "$lib/helpers";

  let id: string;
  let sender: string = "Ekjon Sender";
  let subject: string = "Ekta kotha chilo";
  let content: string = "hehe";
  let creator_id: string = "";
  let file_id: string = "";
  let file: FileObj = new FileObj();
  let creation_date: Date;
  let notice_level: string;
  let notice_level_id: string;
  let notice_level_name: string;
  let redirect: string;
  const type_map: Map<string, string> = new Map([
    ["team", "Team"],
    ["thread", "Thread"],
    ["org", "Organization"],
  ]);
  //let content: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque pulvinar velit, quis consequat diam ullamcorper et. Integer ut blandit nibh, quis egestas tortor. Sed vitae consequat ipsum. Phasellus imperdiet cursus rutrum. Etiam venenatis at nisi a fringilla. Aenean rhoncus hendrerit arcu, a vestibulum leo porttitor vitae. Duis nec augue eros. Proin sit amet sapien fermentum, faucibus lectus et, ultrices quam. Ut pharetra pellentesque lectus, sit amet sagittis turpis fermentum vel. Donec volutpat ullamcorper pretium. Suspendisse eleifend imperdiet malesuada. Fusce nec orci nisi. In eu dignissim dolor, at elementum elit. Aenean eros leo, mollis a neque eu, fringilla volutpat odio. Duis imperdiet erat sit amet diam aliquet porttitor. In non lorem vel purus mollis vehicula. Donec volutpat nunc eget tempus gravida. Aliquam diam tortor, tincidunt quis quam vitae, varius tincidunt odio. Pellentesque sed tellus eu mauris finibus semper in interdum nisi. Praesent eros sapien, fringilla mattis tincidunt pretium, lacinia euismod nunc. Mauris lorem nibh, facilisis nec hendrerit a, bibendum id nisi. Fusce sed massa efficitur, convallis magna ac, iaculis magna. Cras ante augue, dapibus ut dui ac, tristique faucibus neque. Aenean eget fermentum lectus. Donec facilisis tellus in ipsum porttitor suscipit at nec orci. Sed non quam sit amet risus porta lacinia eget sed lacus. Donec pharetra nunc dolor, ac accumsan risus tempus eget. Cras pharetra purus sit amet magna malesuada, vitae posuere orci pharetra. Proin faucibus augue in condimentum dapibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras a erat erat. Duis iaculis consequat dignissim. In sollicitudin rutrum velit, vel elementum lorem aliquam sit amet. Curabitur ac nulla ipsum. Integer laoreet maximus massa a tincidunt. Nunc vitae est dui. Phasellus a laoreet magna, eu ullamcorper massa. Etiam et elit non diam porttitor mattis. Vivamus imperdiet suscipit tellus, elementum porttitor felis egestas sit amet. Donec ut eros at ipsum dapibus eleifend id eget dolor. Quisque sed sagittis magna. Nulla et metus et nisl gravida luctus et vitae ipsum. Suspendisse ac massa ut enim vulputate consequat. Fusce luctus arcu quis malesuada ultricies. Aenean vitae risus vel dolor rhoncus consectetur. Aenean imperdiet enim non tempor convallis. Quisque maximus ac tortor eget tincidunt. Phasellus gravida non lorem eu sollicitudin. Aenean convallis leo varius risus accumsan, at auctor lectus aliquet. Praesent mattis elit et leo facilisis viverra. Praesent lorem augue, maximus sed imperdiet eget, consequat vitae lorem. Vivamus eget molestie mauris. Nam quis lacus eros. Sed et sapien in lectus pharetra dapibus quis quis quam. Cras efficitur iaculis erat. Phasellus vehicula metus urna, in molestie dolor aliquam eget. Cras nisl sapien, sodales vitae erat ut, euismod posuere neque. Integer varius scelerisque libero, nec molestie libero tristique et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus scelerisque pulvinar velit, quis consequat diam ullamcorper et. Integer ut blandit nibh, quis egestas tortor. Sed vitae consequat ipsum. Phasellus imperdiet cursus rutrum. Etiam venenatis at nisi a fringilla. Aenean rhoncus hendrerit arcu, a vestibulum leo porttitor vitae. Duis nec augue eros. Proin sit amet sapien fermentum, faucibus lectus et, ultrices quam. Ut pharetra pellentesque lectus, sit amet sagittis turpis fermentum vel. Donec volutpat ullamcorper pretium. Suspendisse eleifend imperdiet malesuada. Fusce nec orci nisi. In eu dignissim dolor, at elementum elit. Aenean eros leo, mollis a neque eu, fringilla volutpat odio. Duis imperdiet erat sit amet diam aliquet porttitor. In non lorem vel purus mollis vehicula. Donec volutpat nunc eget tempus gravida. Aliquam diam tortor, tincidunt quis quam vitae, varius tincidunt odio. Pellentesque sed tellus eu mauris finibus semper in interdum nisi. Praesent eros sapien, fringilla mattis tincidunt pretium, lacinia euismod nunc. Mauris lorem nibh, facilisis nec hendrerit a, bibendum id nisi. Fusce sed massa efficitur, convallis magna ac, iaculis magna. Cras ante augue, dapibus ut dui ac, tristique faucibus neque. Aenean eget fermentum lectus. Donec facilisis tellus in ipsum porttitor suscipit at nec orci. Sed non quam sit amet risus porta lacinia eget sed lacus. Donec pharetra nunc dolor, ac accumsan risus tempus eget. Cras pharetra purus sit amet magna malesuada, vitae posuere orci pharetra. Proin faucibus augue in condimentum dapibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras a erat erat. Duis iaculis consequat dignissim. In sollicitudin rutrum velit, vel elementum lorem aliquam sit amet. Curabitur ac nulla ipsum. Integer laoreet maximus massa a tincidunt. Nunc vitae est dui. Phasellus a laoreet magna, eu ullamcorper massa. Etiam et elit non diam porttitor mattis. Vivamus imperdiet suscipit tellus, elementum porttitor felis egestas sit amet. Donec ut eros at ipsum dapibus eleifend id eget dolor. Quisque sed sagittis magna. Nulla et metus et nisl gravida luctus et vitae ipsum. Suspendisse ac massa ut enim vulputate consequat. Fusce luctus arcu quis malesuada ultricies. Aenean vitae risus vel dolor rhoncus consectetur. Aenean imperdiet enim non tempor convallis. Quisque maximus ac tortor eget tincidunt. Phasellus gravida non lorem eu sollicitudin. Aenean convallis leo varius risus accumsan, at auctor lectus aliquet. Praesent mattis elit et leo facilisis viverra. Praesent lorem augue, maximus sed imperdiet eget, consequat vitae lorem. Vivamus eget molestie mauris. Nam quis lacus eros. Sed et sapien in lectus pharetra dapibus quis quis quam. Cras efficitur iaculis erat. Phasellus vehicula metus urna, in molestie dolor aliquam eget. Cras nisl sapien, sodales vitae erat ut, euismod posuere neque. Integer varius scelerisque libero, nec molestie libero tristique et.";
  let is_logged_in: boolean = false;
  function check_logged_in(): boolean {
    if ($page.data.session?.user?.name) {
      return true;
    } else {
      return false;
    }
  }
  // $:check_logged_in();
  async function get_notice_details(): Promise<void> {
    data_loaded = false;
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
        // console.log(response_obj);
        content = response_obj.f_content;
        subject = response_obj.f_subject;
        sender = response_obj.f_creator_name;
        creator_id = response_obj.f_creator_id;
        file_id = response_obj.f_related_file_id;
        creation_date = new Date(response_obj.f_created_at);
        notice_level = response_obj.f_hierarchy_level;
        notice_level_name = response_obj.f_hierarchy_name;
        notice_level_id = response_obj.f_hierarchy_level_id;
        redirect = "/" + notice_level + "/" + notice_level_id;
        if (file_id != null) {
          get_file_details();
        }

        data_loaded = true;
      },
    );
  }
  async function get_file_details(): Promise<void> {
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
        console.log(response_obj);
        file = new FileObj();
        file.id = response_obj.result1.fileid;
        file.name = response_obj.result1.filename;
        file.type = response_obj.result1.file_extension;
        // console.log(file);
      },
    );
  }

  let file_uploading_modal_elem: HTMLDivElement;
  let file_upload_progress: HTMLDivElement;
  let file_uploading_modal: Modal;
  let data_loaded: boolean = false;

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
          },
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
          },
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
            file_buffer,
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
              },
            );
          }
        }

        get_notice_details();
      }

      file_uploading_modal.hide();
    };

    file_input_elem.click();
  }

  onMount((): void => {
    initModals();

    file_uploading_modal = new Modal(file_uploading_modal_elem);
    id = $page.params.id;

    get_notice_details();
  });
</script>

<div class="notice-root">
  <div
    class="notice-root-card block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
  >
    {#if data_loaded}
      <div class="details" in:fade={{ duration: 250 }}>
        <p class="text-4xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {subject}
        </p>
        <div class="grid grid-cols-4 mb-4">
          <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            Created At
          </p>
          <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            Sender
          </p>
          <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            Notifier Type
          </p>
          <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            Notifier Entity
          </p>
          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-red-500 dark:text-red-400 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v12c0 .6.4 1 1 1Z"
              />
            </svg>
            <p
              class="text-base font-medium text-gray-700 dark:text-gray-200 me-1"
            >
              {make_date(creation_date)} • {make_time(creation_date)}
            </p>
          </div>
          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-indigo-500 dark:text-indigo-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-width="2"
                d="M7 17v1c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <p
              class="text-base font-medium text-gray-700 dark:text-gray-200 me-1"
            >
              {sender}
            </p>
          </div>

          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-green-500 dark:text-green-400 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h0"
              />
            </svg>
            <p
              class="text-base font-medium text-gray-700 dark:text-gray-200 me-1"
            >
              {type_map.get(notice_level)}
            </p>
          </div>
          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-blue-500 dark:text-blue-400 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h0"
              />
            </svg>
            <a href={redirect}>
              <p
                class="text-base font-medium text-gray-700 dark:text-gray-200 me-1"
              >
                {notice_level_name}
              </p>
            </a>
          </div>
        </div>
        <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
          Content
        </p>
      </div>
      <div class="grow overflow-y-auto" in:fade={{ duration: 250 }}>
        <p class="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">
          {content}
        </p>
      </div>
      <div in:fade={{ duration: 250 }}>
        <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
          Attached File
        </p>
        {#if $logged_in_store}
          {#if file_id !== null && file_id !== undefined}
            <FileCard
              file_id={file.id}
              file_name={file.name}
              file_type={file.type}
              file_status={file.status}
            />
          {:else}
            <p
              class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              No Attached Files
            </p>
          {/if}
        {:else}
          <p class="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            Log in to view Attached File
          </p>
        {/if}

        <div class="flex justify-end mt-2">
          {#if creator_id == $page.data.session?.user?.name}
            {#if file_id === null || file_id === undefined}
              <button
                on:click={add_file}
                type="button"
                class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >Add File</button
              >
            {/if}
          {/if}
        </div>
      </div>
    {:else}
      <div class="flex justify-center items-center" style="height: 100%;">
        <div role="status">
          <svg
            aria-hidden="true"
            class="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    {/if}
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
  .notice-root {
    position: absolute;
    top: 5.25rem;
    bottom: 1rem;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .notice-root-card {
    position: absolute;
    width: 65rem;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  @media (max-width: 1099px) {
    .notice-root {
      margin-left: 1rem;
      margin-right: 1rem;
    }
    .notice-root-card {
      width: 100%;
    }
  }
</style>
