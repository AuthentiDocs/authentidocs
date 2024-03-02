<script lang="ts">
  import { onMount } from "svelte";
  import { Modal, initModals } from "flowbite";
  import { page } from "$app/stores";
  import {
    AddableMemberObj,
    Entity,
    FileObj,
    MemberObj,
    Tab,
  } from "$lib/containers";
  import { common_fetch } from "$lib/fetch_func";
  import List from "$lib/components/list.svelte";
  import MemberCard from "$lib/components/team/member-card.svelte";
  import FileCard from "$lib/components/team/file-card.svelte";
  import ThreadCard from "$lib/components/team/thread-card.svelte";
  import SendNotice from "$lib/components/send-notice.svelte";
  import AddMember from "$lib/components/add-member.svelte";
  import Notice from "$lib/components/notice.svelte";
  import Create from "$lib/components/create.svelte";
  import { priv_key } from "$lib/stores";
  import { get } from "svelte/store";
  import { fade } from "svelte/transition";
  let tabs: Tab[] = [
    {
      name: "Details",
      active: true,
    },
    {
      name: "Threads",
      active: false,
    },
    {
      name: "Files",
      active: false,
    },
    {
      name: "Members",
      active: false,
    },
    {
      name: "Notices",
      active: false,
    },
  ];
  let threads_filter: string;
  let threads: Entity[] = [];
  let threads_filtered: Entity[] = [];
  let notices_filter: string;
  let notices: Entity[] = [];
  let notices_filtered: Entity[] = [];
  let id: string;
  let data_loaded: boolean = false;
  let team_name: string;
  let team_leader: string;
  let add_member_modal: Modal;
  let files_filter: string;
  let files: FileObj[] = [];
  let files_filtered: FileObj[] = [];
  let members_filter: string;
  let members: MemberObj[] = [];
  let members_filtered: MemberObj[] = [];
  let threads_loaded: boolean = false;
  let files_loaded: boolean = false;
  let members_loaded: boolean = false;
  let notices_loaded: boolean = false;
  let thread_count: number = 0;
  let file_count: number;
  let thread_empty: boolean;
  let member_count: number = 0;
  let files_empty: boolean;
  let members_empty: boolean;
  let notices_empty: boolean;
  let send_notice_modal: Modal;
  let team_creation_date: Date;
  let team_description: string;
  let date_text: string;
  let create_thread_modal: Modal;
  let is_admin: boolean = false;

  let file_uploading_modal_elem: HTMLDivElement;
  let file_upload_progress: HTMLDivElement;
  let file_uploading_modal: Modal;


  let is_logged_in: boolean = false;
  function check_logged_in(): boolean {
    if ($page.data.session?.user?.name) {
      return true;
    } else {
      return false;
    }
  }
  $: is_logged_in = check_logged_in();
  

  $: thread_empty = threads_filtered.length === 0;
  $: files_empty = files_filtered.length === 0;
  $: members_empty = members_filtered.length === 0;
  $: notices_empty = notices_filtered.length === 0;
  $:
  {
    if(files_filter !== null && files_filter !== undefined && files_filter.length > 0)
    {
      files_filtered = [];

      for(let i: number = 0; i < files.length; ++i)
      {
        if(files[i].name.match(files_filter))
        {
          files_filtered.push(files[i]);
        }
      }
    }
    else
    {
      files_filtered = Array.from(files);
    }
  }
  $:
  {
    if(members_filter !== null && members_filter !== undefined && members_filter.length > 0)
    {
      members_filtered = [];

      for(let i: number = 0; i < members.length; ++i)
      {
        if(members[i].name.match(members_filter))
        {
          members_filtered.push(members[i]);
        }
      }
    }
    else
    {
      members_filtered = Array.from(members);
    }
  }
  $:
  {
    if(threads_filter !== null && threads_filter !== undefined && threads_filter.length > 0)
    {
      threads_filtered = [];

      for(let i: number = 0; i < threads.length; ++i)
      {
        if(threads[i].name.match(threads_filter))
        {
          threads_filtered.push(threads[i]);
        }
      }
    }
    else
    {
      threads_filtered = Array.from(threads);
    }
  }
  $:
  {
    if(notices_filter !== null && notices_filter !== undefined && notices_filter.length > 0)
    {
      notices_filtered = [];

      for(let i: number = 0; i < notices.length; ++i)
      {
        if(notices[i].name.match(notices_filter))
        {
          notices_filtered.push(notices[i]);
        }
      }
    }
    else
    {
      notices_filtered = Array.from(notices);
    }
  }

  function reset_tabs(): void {
    for (let i: number = 0; i < tabs.length; ++i) {
      tabs[i].active = false;
    }
  }

  function show_tab(idx: number): void {

    reset_tabs();
    tabs[idx].active = true;
  

  }

  function get_threads(): void {
    fetch("/api/team/getthreads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        teamid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      threads = new Array(response_obj.length);

      for (let i: number = 0; i < threads.length; ++i) {
        threads[i] = new Entity();
        threads[i].uid = response_obj[i].f_threadid;
        threads[i].name = response_obj[i].f_threadname;
      }

      threads_loaded = true;
      threads_filtered = Array.from(threads);
      threads_filter = "";
    });
  }

  function get_team_details(): void {
    data_loaded = false;
    let request_obj: any = {
      teamid: id,
    };

    common_fetch(
      "/api/team/getdetails",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        if (response_obj === null) {
          return;
        }

        let team_info = response_obj;
        //console.log(team_info);
        team_name = team_info.team_detail.f_team_name;
        team_leader = team_info.team_mod_detail.f_username;
        member_count = team_info.team_detail.f_member_count;
        thread_count = team_info.team_detail.f_thread_count;
        file_count = team_info.team_detail.f_file_count;
        team_description = team_info.team_detail.f_description;
        team_creation_date = new Date(team_info.team_detail.f_created_at);
        date_text = team_creation_date.toLocaleDateString();
        data_loaded = true;
      }
    );
  }

  function get_notices(): void {
    let request_obj: any = {
      teamid: id,
    };

    common_fetch(
      "/api/team/getnotices",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        if (response_obj === null) {
          return;
        }
        //console.log(response_obj)
        notices = new Array(response_obj.length);
        for (let i = 0; i < notices.length; ++i) {
          notices[i] = new Entity();
          notices[i].uid = response_obj[i].f_noticeid;
          notices[i].name = response_obj[i].f_subject;
        }
        notices_loaded = true;
        notices_filtered = Array.from(notices);
        notices_filter = "";
      }
    );
  }
  function get_files(): void {
    let request_obj: any = {
      teamid: id,
    };

    common_fetch(
      "/api/team/getfiles",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        if (response_obj === null) {
          return;
        }
        //console.log(response_obj);
        files = new Array(response_obj.length);

        for (let i: number = 0; i < response_obj.length; ++i) {
          files[i] = new FileObj();
          files[i].id = response_obj[i].f_fileid;
          files[i].name = response_obj[i].f_filename;
          files[i].type = response_obj[i].f_file_extension;
        }
        //console.log(files)
        files_loaded = true;
        files_filtered = Array.from(files);
        files_filter = "";
      }
    );
  }
  function create_thread(id: string, name: string, description: string): void {
    fetch("/api/thread/createthread", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_parent_teamid: id,
        given_threadname: name,
        description: description,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      create_thread_modal.hide();
      get_threads();
    });
  }
  function get_members(): void {
    let request_obj: any = {
      teamid: id,
    };

    common_fetch(
      "/api/team/getmembers",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        if (response_obj === null) {
          return;
        }
        console.log(response_obj);
        members = new Array(response_obj.length);

        for (let i: number = 0; i < response_obj.length; ++i) {
          members[i] = new MemberObj();
          members[i].id = response_obj[i].f_userid;
          members[i].name = response_obj[i].f_username;
          members[i].role = response_obj[i].f_user_role;
          members[i].serial = response_obj[i].f_signing_serial;
          members[i].pubkey = response_obj[i].f_publickey;
          members[i].joined = new Date(response_obj[i].f_joined_at);
        }

        members_loaded = true;
      }
    );
  }

  async function get_addable_members(id: string): Promise<AddableMemberObj[]> {
    let response: Response = await fetch("/api/team/getaddablemembers", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        teamid: id,
      }),
    });
    let response_obj: any = await response.json();
    let addable_members: AddableMemberObj[] = new Array(response_obj.length);

    for (let i: number = 0; i < addable_members.length; ++i) {
      addable_members[i] = new AddableMemberObj();
      addable_members[i].id = response_obj[i].f_userid;
      addable_members[i].name = response_obj[i].f_username;
    }

    return addable_members;
  }

  async function add_member(
    id: string,
    members: AddableMemberObj[]
  ): Promise<any> {
    let adding_members = [];
    let count = 0;
    for (let i = 0; i < members.length; i++) {
      if (members[i].checked) {
        adding_members[count++] = members[i].id;
      }
    }
    let response: Response = await fetch("/api/team/addmember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid_list: adding_members,
        teamid: id,
      }),
    });

    let response_obj: any = await response.json();

    //console.log(response_obj);
  }

  async function send_notice_request(
    id: string,
    subject: string,
    content: string
  ): Promise<any> {
    let response: Response = await fetch("/api/notice/addnotice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hierarchy_level: "team",
        hierarchy_level_id: id,
        content: content,
        subject: subject,
      }),
    });

    let response_obj: any = await response.json();

    //console.log(response_obj);
  }
  async function check_admin(): Promise<void> {
    let response: Response = await fetch("/api/user/isadmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: "team",
        level_id: id,
        id: $page.data.session?.user?.name,
      }),
    });
    let response_obj: any = await response.json();
    console.log(response_obj);
    is_admin = response_obj;
  }
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
          "/api/team/addteamchunkfile/continue?filename=" + file.name,
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
          "/api/team/addteamchunkfile/finish?filename=" +
            file.name +
            "&teamid=" +
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
          get_files();
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

  onMount((): void => {
    initModals();
    id = $page.params.id;

    file_uploading_modal = new Modal(file_uploading_modal_elem);

    get_team_details();
    if(is_logged_in)
    {
    get_threads();
    get_notices();
    get_members();
    get_files();
    check_admin();
    }

  });
</script>

<svelte:head>
  <title>{team_name} preview</title>
</svelte:head>
<div class="pg-center flex justify-between">
    <!-- svelte-ignore a11y-invalid-attribute -->
    <div class="thread-info block bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-6">
      {#if is_logged_in}
        <ul class="thread-tabs flex flex-wrap justify-center items-center text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {#each tabs as tab, index}
                <li class="mx-1">
                    {#if tab.active}
                        <a href="javascript:" class="inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active">{tab.name}</a>
                    {:else}
                        <a on:click={() => {show_tab(index)}} href="javascript:" class="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white">{tab.name}</a>
                    {/if}
                </li>    
            {/each}
        </ul>
        {/if}
        <div class="tab-item-data">
          {#if tabs[0].active}
            {#if data_loaded}
              <div class="details" in:fade={{duration: 250}}>
                <p class="text-4xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{team_name}</p>
                <div class="grid grid-cols-4 mb-4">
                    <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">Created At</p>
                    <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">Files</p>
                    <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">Members</p>
                    <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">Threads</p>
                    <div class="flex items-center">
                        <svg class="w-6 h-6 text-red-500 dark:text-red-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v12c0 .6.4 1 1 1Z"/>
                        </svg>
                        <p class="text-base font-medium text-gray-700 dark:text-gray-200 me-1">
                            <span>{date_text}</span>
                        </p>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-6 h-6 text-blue-500 dark:text-blue-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M10 3v4c0 .6-.4 1-1 1H5m14-4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1Z"/>
                        </svg>
                        <p class="text-base font-medium text-gray-700 dark:text-gray-200 me-1">{file_count}</p>
                        <!-- <p class="text-base font-medium text-red-500 dark:text-red-400 me-2">[5 Unsigned]</p> -->
                    </div>
                    
                    <div class="flex items-center">
                        <svg class="w-6 h-6 text-indigo-500 dark:text-indigo-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-width="2" d="M7 17v1c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                        <p class="text-base font-medium text-gray-700 dark:text-gray-200 me-1">{member_count}</p>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-6 h-6 text-green-500 dark:text-green-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 0 0-2 2v4m5-6h8M8 7V5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2m0 0h3a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6m18 0s-4 2-9 2-9-2-9-2m9-2h0"/>
                        </svg>
                        <p class="text-base font-medium text-gray-700 dark:text-gray-200 me-1">{thread_count}</p>
                    </div>
                </div>
                <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">Description</p>
                <p class="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">{team_description}</p>
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
          {:else if tabs[1].active}
              <div class="mb-2">
                  <p class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1">Threads</p>
                  <div class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                  </div>
                  <input bind:value={threads_filter} type="search" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Filter" autocomplete="off" required />
                  </div>
              </div>
              <List loaded={threads_loaded} empty={thread_empty}>
                  {#each threads_filtered as thread}
                      <li>
                          <ThreadCard id={thread.uid} name={thread.name} />
                      </li>
                  {/each}
              </List>
              <div class="flex justify-end mt-2">
                  <button on:click={() => {create_thread_modal.show();}} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mx-2 mb-2">Create Thread</button>
              </div>
          {:else if tabs[2].active}
              <div class="mb-2">
                  <p
                  class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
                  >
                  Files
                  </p>
                  <div class="relative">
                  <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                  </div>
                  <input bind:value={files_filter} type="search" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Filter" autocomplete="off" required />
                  </div>
              </div>
              <List loaded={files_loaded} empty={files_empty}>
                  {#each files_filtered as file}
                      <li>
                          <FileCard file_id={file.id} file_name={file.name} file_type={file.type} file_status={file.status}/>
                      </li>
                  {/each}
              </List>
               <!-- Add File -->
              <div class="flex justify-end mt-2">
              <button on:click={add_file} type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" >Add File</button>
            </div>
              {:else if tabs[3].active}
            <div class="mb-2">
                <p
                class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
                >
                Members
                </p>
                <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input bind:value={members_filter} type="search" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Filter" autocomplete="off" required />
                </div>
            </div>
            <List loaded={members_loaded} empty={members_empty}>
                {#each members_filtered as member}
                    <li>
                        <MemberCard team_id={id} id={member.id} name={member.name} type={member.role} joined_at={member.joined} pub_key={member.pubkey} is_admin={is_admin}/>
                    </li>
                {/each}
            </List>
            <div class="flex justify-end mt-2">
                <button on:click={() => {add_member_modal.show();}} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ms-2 mb-2">Add Member</button>
            </div>
          {:else if tabs[4].active}
            <div class="mb-2">
                <p
                class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
                >
                    Notices
                </p>
                <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input bind:value={notices_filter} type="search" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Filter" autocomplete="off" required />
                </div>
            </div>
            <List loaded={notices_loaded} empty={notices_empty}>
                {#each notices_filtered as notice}
                    <li>
                        <Notice uid={notice.uid} title={notice.name}/>
                    </li>
                {/each}
            </List>
            <div class="flex justify-end mt-2">
                <button on:click={() => {send_notice_modal.show();}} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mx-2 mb-2">Send Notice</button>
            </div>
        {/if}
    </div>
  </div>
</div>
{#if is_logged_in}
<SendNotice bind:modal={send_notice_modal} {id} {send_notice_request} />
<AddMember bind:modal={add_member_modal} {get_addable_members} {add_member} />
<Create
  bind:modal={create_thread_modal}
  {id}
  creation_request={create_thread}
/>
{/if}
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
  .pg-center {
    position: absolute;
    top: 5.25rem;
    bottom: 1rem;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .thread-info {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 65rem;
    display: flex;
    flex-direction: column;
  }
  .tab-item-data {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .details {
    height: 100%;
  }
  @media (max-width: 1099px) {
    .pg-center {
      margin-left: 1rem;
      margin-right: 1rem;
    }
    .thread-info {
      width: 100%;
    }
  }
</style>
