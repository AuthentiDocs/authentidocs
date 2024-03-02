<script lang="ts">
  import { page } from "$app/stores";
  import AddMember from "$lib/components/add-member.svelte";
  import List from "$lib/components/list.svelte";
  import { Entity, ForumMessage, ForumThread } from "$lib/containers";
  import FileCard from "$lib/components/thread/file-card.svelte";
  import MemberCard from "$lib/components/thread/member-card.svelte";
  import ForumThreadCard from "$lib/components/thread/forum-thread-card.svelte";
  import { MemberObj, AddableMemberObj, FileObj, Tab } from "$lib/containers";
  import { Modal } from "flowbite";
  import { onMount } from "svelte";
  import Notice from "$lib/components/notice.svelte";
  import { common_fetch } from "$lib/fetch_func";
  import SendNotice from "$lib/components/send-notice.svelte";
  import { Dropdown, DropdownItem } from "flowbite-svelte";
  import ForumPost from "$lib/components/thread/forum-post.svelte";
  import { fade } from "svelte/transition";

  let tabs: Tab[] = [
    {
      name: "Details",
      active: true,
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
    {
      name: "Forum",
      active: false,
    },
  ];
  let id: string;
  let thread_name: string;
  let team_name: string;
  let description: string;
  let moderator: string;
  let current_custodian: string;
  let started_at: Date;
  let date_text: string;
  let time_text: string;
  let files_filter: string;
  let files: FileObj[] = [];
  let files_filtered: FileObj[] = [];
  let members_filter: string;
  let members: MemberObj[] = [];
  let members_filtered: MemberObj[] = [];
  let is_active: boolean;
  let can_forward: boolean;
  let can_close: boolean;
  let can_add_file: boolean;
  let closing_comment: string;
  let member_count: number;
  let members_empty: boolean;
  let file_count: number;
  let files_empty: boolean;
  let close_thread_modal_elem: HTMLDivElement;
  let file_uploading_modal_elem: HTMLDivElement;
  let file_upload_progress: HTMLDivElement;
  let close_thread_modal: Modal;
  let add_member_modal: Modal;
  let file_uploading_modal: Modal;
  let files_loaded: boolean = false;
  let members_loading: boolean;
  let notices_loaded: boolean = false;
  let notices_empty: boolean;
  let notices_filter: string;
  let notices: Entity[] = [];
  let notices_filtered: Entity[] = [];
  let send_notice_modal: Modal;
  let forwardable_members: AddableMemberObj[] = [];
  let selected_memberid: string;
  let is_admin: boolean = false;
  let add_forum_thread_modal_elem: HTMLDivElement;
  let add_forum_thread_modal: Modal;
  let forum_thread_name: string;
  let add_forum_thread_form: HTMLFormElement;
  let forum_threads: ForumThread[] = [];
  let forum_thread_selected: boolean = false;
  let selected_forum_thread: ForumThread;
  let forum_messages: ForumMessage[] = [];
  let add_post_modal_elem: HTMLDivElement;
  let add_post_modal: Modal;
  let add_post_form: HTMLFormElement;
  let post_text: string;
  let data_loaded: boolean = false;

  let is_logged_in: boolean = false;
  function check_logged_in(): boolean {
    if ($page.data.session?.user?.name) {
      return true;
    } else {
      return false;
    }
  }
  $: is_logged_in = check_logged_in();
  $: date_text = started_at?.toLocaleDateString();
  $: time_text = started_at?.toLocaleTimeString();
  $: {
    id = $page.params.id;

    init();
  }

  $: files_empty = files_filtered.length === 0;
  $: members_empty = members_filtered.length === 0;
  $: file_count = files.length;
  $: member_count = members.length;
  $: notices_empty = notices_filtered.length === 0;
  $: {
    if (
      files_filter !== null &&
      files_filter !== undefined &&
      files_filter.length > 0
    ) {
      files_filtered = [];

      for (let i: number = 0; i < files.length; ++i) {
        if (files[i].name.match(files_filter)) {
          files_filtered.push(files[i]);
        }
      }
    } else {
      files_filtered = Array.from(files);
    }
  }
  $: {
    if (
      members_filter !== null &&
      members_filter !== undefined &&
      members_filter.length > 0
    ) {
      members_filtered = [];

      for (let i: number = 0; i < members.length; ++i) {
        if (members[i].name.match(members_filter)) {
          members_filtered.push(members[i]);
        }
      }
    } else {
      members_filtered = Array.from(members);
    }
  }
  function get_files(): void {
    let request_obj: any = {
      thread_id: id,
    };

    common_fetch(
      "/api/thread/getfiles",
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
  function post_message(): void {
    fetch("/api/forum/addtopposts", {
      method: "POST",
      body: JSON.stringify({
        content: post_text,
        thread_name: selected_forum_thread.id,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        select_thread(selected_forum_thread);
      } else {
        console.error(response.status, response.statusText);
      }

      add_forum_thread_form.reset();
      post_text = "";
      add_post_modal.hide();
    });
  }

  function select_thread(forum_thread: ForumThread): void {
    forum_thread_selected = true;
    selected_forum_thread = forum_thread;

    fetch("/api/forum/getforumtoplevelpost", {
      method: "POST",
      body: JSON.stringify({
        forum_id: selected_forum_thread.id,
      }),
    }).then(async (response: Response) => {
      if (response.status === 200) {
        let response_obj: any = await response.json();
        forum_messages = new Array(response_obj.length);

        for (let i: number = 0; i < forum_messages.length; ++i) {
          forum_messages[i] = new ForumMessage();
          forum_messages[i].id = response_obj[i].f_postid;
          forum_messages[i].sender = response_obj[i].f_creator_id;
          forum_messages[i].content = response_obj[i].f_content;
          forum_messages[i].created_at = new Date(response_obj[i].f_created_at);
        }
      } else {
        console.error(response.status, response.statusText);
      }
    });
  }

  function add_forum_thread(): void {
    fetch("/api/forum/makethread", {
      method: "POST",
      body: JSON.stringify({
        hierarchy_level: "thread",
        hierarchy_level_id: id,
        subject: "",
        thread_name: forum_thread_name,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        get_forum_threads();
      } else {
        console.error(response.status, response.statusText);
      }

      add_forum_thread_form.reset();
      add_forum_thread_modal.hide();
    });
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

  function get_members(): void {
    fetch("/api/thread/getmembers", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_threadid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      members = new Array(response_obj.length);

      for (let i: number = 0; i < members.length; ++i) {
        members[i] = new MemberObj();
        members[i].id = response_obj[i].f_userid;
        members[i].name = response_obj[i].f_username;
        members[i].role = response_obj[i].f_user_role;
        members[i].serial = response_obj[i].f_signing_serial;
        members[i].pubkey = response_obj[i].f_publickey;
        members[i].joined = new Date(response_obj[i].f_joined_at);
      }

      // let test_count: number = 0;
      // members = new Array(test_count);

      // for(let i: number = 0; i < test_count; ++i)
      // {
      //     members[i] = new MemberObj();
      //     members[i].id = (i + 1).toString();
      //     members[i].name = "Member " + (i + 1);
      // }

      members_loading = false;
      members_filtered = Array.from(members);
      members_filter = "";
    });
  }
  async function get_forwardable_members(): Promise<void> {
    let response: Response = await fetch("/api/thread/getforwardablemembers", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_threadid: id,
      }),
    });
    let response_obj: any = await response.json();
    //console.log(response_obj)
    forwardable_members = new Array(response_obj.length);
    for (let i: number = 0; i < forwardable_members.length; ++i) {
      forwardable_members[i] = new AddableMemberObj();
      forwardable_members[i].id = response_obj[i].f_user_id;
      forwardable_members[i].name = response_obj[i].f_username;
    }
    //console.log(forwardable_members)
  }

  function get_forum_threads(): void {
    fetch("/api/forum/getallforumthread", {
      method: "POST",
      body: JSON.stringify({
        hierarchy_level_id: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      if (response.status === 200) {
        let response_obj = await response.json();
        forum_threads = new Array(response_obj.length);

        for (let i: number = 0; i < forum_threads.length; ++i) {
          forum_threads[i] = new ForumThread();
          forum_threads[i].id = response_obj[i].f_forumid;
          forum_threads[i].name = response_obj[i].f_forum_thread_name;
        }
      } else {
        console.error(response.status, response.statusText);
      }
    });
  }

  function flex_forward(): void {
    fetch("/api/thread/flexforward", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        threadid: id,
        targetid: selected_memberid,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();

      console.log(response_obj);
      init();
    });
  }
  async function get_addable_members(id: string): Promise<AddableMemberObj[]> {
    let response: Response = await fetch("/api/thread/getaddablemembers", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_threadid: id,
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
    let response: Response = await fetch("/api/thread/addmember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid_list: adding_members,
        threadid: id,
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
        hierarchy_level: "thread",
        hierarchy_level_id: id,
        content: content,
        subject: subject,
      }),
    });

    let response_obj: any = await response.json();

    //console.log(response_obj);
    send_notice_modal.hide();
    get_notices();
  }
  function get_notices(): void {
    let request_obj: any = {
      threadid: id,
    };

    common_fetch(
      "/api/thread/getnotices",
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
          "/api/thread/addthreadchunkfile/continue?filename=" + file.name,
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
          "/api/thread/addthreadchunkfile/finish?filename=" +
            file.name +
            "&threadid=" +
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
          init();
        });
      } else {
        file_uploading_modal.hide();
      }
    };

    file_input_elem.click();
  }

  function forward(): void {
    fetch("/api/thread/forward", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        threadid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();

      //console.log(response_obj);
      init();
    });
  }

  function show_close_thread_modal(): void {
    close_thread_modal.show();
  }

  function hide_close_thread_modal(): void {
    close_thread_modal.hide();
  }

  function close_thread(): void {
    let temp_comment: string = closing_comment;

    if (temp_comment === undefined) {
      temp_comment = "";
    }

    fetch("/api/thread/makearchive", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        closing_comment: temp_comment,
        threadid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();

      //console.log(response_obj);
      close_thread_modal.hide();
      init();
    });
  }
  async function check_admin(): Promise<void> {
    let response: Response = await fetch("/api/user/isadmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: "thread",
        level_id: id,
        id: $page.data.session?.user?.name,
      }),
    });

    let response_obj: any = await response.json();
    //console.log(response_obj)
    is_admin = response_obj;
  }

  function init(): void {
    data_loaded = false;
    members_loading = true;
    files_loaded = false;

    fetch("/api/thread/getdetails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        threadid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      thread_name = response_obj.thread_detail.threadname;
      team_name = response_obj.thread_detail.list_of_teams.slice(1);
      started_at = new Date(response_obj.thread_detail.created_at);
      moderator = response_obj.thread_mod_detail.f_username;

      if (response_obj.thread_current_custodian_detail !== undefined) {
        current_custodian =
          response_obj.thread_current_custodian_detail.f_username;
      }

      description = response_obj.thread_detail.description;
      closing_comment = response_obj.thread_detail.closing_comment;
      is_active = response_obj.thread_detail.is_active;
      let thread_current_custodian_detail: any =
        response_obj.thread_current_custodian_detail;
        data_loaded = true;
        get_members();
        get_files();
        if(is_logged_in)
        {

      fetch("/api/thread/getfiles", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          thread_id: id,
        }),
      }).then(async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();
        files = new Array(response_obj.length);

        for (let i: number = 0; i < files.length; ++i) {
          files[i] = new FileObj();
          files[i].id = response_obj[i].f_fileid;
          files[i].name = response_obj[i].f_filename;
          files[i].type = response_obj[i].f_file_extension;

          if (
            thread_current_custodian_detail === undefined ||
            thread_current_custodian_detail.f_userid !==
              $page.data.session?.user?.name
          ) {
            files[i].status = 3;
          } else {
            files[i].status = response_obj[i].f_current_state;
          }
        }

        // let test_count: number = 10;
        // files = new Array(test_count);

        // for(let i: number = 0; i < test_count; ++i)
        // {
        //     files[i] = new FileObj();
        //     files[i].id = (i + 1).toString();
        //     files[i].name = "File " + (i + 1);
        //     files[i].status = "hehe";
        //     files[i].type = "png";
        // }

        files_loaded = true;
        files_filtered = Array.from(files);
        files_filter = "";
      });

      data_loaded = true;
        }
    });
    if(is_logged_in)
    {
        fetch("/api/thread/canforward", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_threadid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      // console.log(response_obj);
      can_forward = response_obj;
    });

    fetch("/api/thread/canclose", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_threadid: id,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      can_close = response_obj;
    });

    fetch("/api/thread/canaddfile", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        given_threadid: id,
        given_userid: $page.data.session?.user?.name,
      }),
    }).then(async (response: Response): Promise<void> => {
      let response_obj: any = await response.json();
      can_add_file = response_obj;
    });

    
    get_notices();
    get_forwardable_members();
    get_forum_threads();
    check_admin();
    }
    
  }

  onMount((): void => {
    id = $page.params.id;
    close_thread_modal = new Modal(close_thread_modal_elem);
    file_uploading_modal = new Modal(file_uploading_modal_elem);
    add_forum_thread_modal = new Modal(add_forum_thread_modal_elem, {
      backdrop: "static",
    });
    add_post_modal = new Modal(add_post_modal_elem);

    init();
  });
</script>

<svelte:head>
  <title>{thread_name} preview</title>
</svelte:head>

<div class="pg-center flex justify-between">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <div
    class="thread-info block bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-6"
  >
  {#if is_logged_in}
    <ul
      class="thread-tabs flex flex-wrap justify-center items-center text-sm font-medium text-center text-gray-500 dark:text-gray-400"
    >
      {#each tabs as tab, index}
        <li class="mx-1">
          {#if tab.active}
            <a
              href="javascript:"
              class="inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active"
              >{tab.name}</a
            >
          {:else}
            <a
              on:click={() => {
                show_tab(index);
              }}
              href="javascript:"
              class="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
              >{tab.name}</a
            >
          {/if}
        </li>
      {/each}
    </ul>
    {/if}
    <div class="tab-item-data">
      {#if tabs[0].active}
        {#if data_loaded}
          <div in:fade={{ duration: 250 }}>
            <p
              class="text-4xl font-semibold text-gray-700 dark:text-gray-200 mb-4"
            >
              {thread_name}
            </p>
            <p
              class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2"
            >
              Moderator
            </p>
            <div class="flex items-center mb-4">
              <img
                class="w-8 h-8 rounded-full me-2"
                src="/pochita.webp"
                alt="Rounded avatar"
              />
              <p class="text-2xl font-medium text-gray-700 dark:text-gray-200">
                {moderator}
              </p>
            </div>
            <p
              class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2"
            >
              Current Custodian
            </p>
            {#if is_active}
              <div class="flex items-center mb-4">
                <img
                  class="w-8 h-8 rounded-full me-2"
                  src="/pochita.webp"
                  alt="Rounded avatar"
                />
                <p
                  class="text-2xl font-medium text-gray-700 dark:text-gray-200"
                >
                  {current_custodian}
                </p>
              </div>
            {:else}
              <p
                class="text-2xl font-medium text-red-500 dark:text-red-400 mb-4"
              >
                Thread Closed
              </p>
            {/if}
            <div class="grid grid-cols-4 mb-4">
              <p
                class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2"
              >
                Files
              </p>
              <p
                class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2"
              >
                Team
              </p>
              <p
                class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2"
              >
                Started At
              </p>
              <p
                class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2"
              >
                Members
              </p>
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
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 3v4c0 .6-.4 1-1 1H5m14-4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1Z"
                  />
                </svg>
                <p
                  class="text-base font-medium text-gray-700 dark:text-gray-200 me-1"
                >
                  {file_count}
                </p>
                <!-- <p class="text-base font-medium text-red-500 dark:text-red-400 me-2">[5 Unsigned]</p> -->
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
                    stroke-width="2"
                    d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                  />
                </svg>
                <p
                  class="text-base font-medium text-gray-700 dark:text-gray-200 me-1"
                >
                  {team_name}
                </p>
              </div>
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
                  <span>{date_text}</span>
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
                  {member_count}
                </p>
              </div>
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
        <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">
          Description
        </p>
        <p class="text-base font-medium text-gray-700 dark:text-gray-200 mb-4">
          {description}
        </p>
        {#if !is_active}
          <p class="text-xl font-medium text-gray-400 dark:text-gray-500 mb-2">
            Closing Comment
          </p>
          <p class="text-base font-medium text-gray-700 dark:text-gray-200">
            {closing_comment}
          </p>
        {/if}
      {:else if tabs[1].active}
        <div class="mb-2">
          <p
            class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
          >
            Files
          </p>
          <div class="relative">
            <div
              class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              bind:value={files_filter}
              type="search"
              id="search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Filter"
              autocomplete="off"
              required
            />
          </div>
        </div>
        <List loaded={files_loaded} empty={files_empty}>
          {#each files_filtered as file}
            <li>
              <FileCard
                file_id={file.id}
                file_name={file.name}
                file_type={file.type}
                file_status={file.status.toString()}
              />
            </li>
          {/each}
        </List>
      {:else if tabs[2].active}
        <div class="mb-2">
          <p
            class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
          >
            Members
          </p>
          <div class="relative">
            <div
              class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              bind:value={members_filter}
              type="search"
              id="search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Filter"
              autocomplete="off"
              required
            />
          </div>
        </div>
        <List loaded={!members_loading} empty={members_empty}>
          {#each members_filtered as member}
            <li>
              <MemberCard
                thread_id={id}
                id={member.id}
                name={member.name}
                serial={member.serial}
                type={member.role}
                joined_at={member.joined}
                pub_key={member.pubkey}
                {is_admin}
              />
            </li>
          {/each}
        </List>
      {:else if tabs[3].active}
        <div class="mb-2">
          <p
            class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
          >
            Notices
          </p>
          <div class="relative">
            <div
              class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              bind:value={notices_filter}
              type="search"
              id="search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Filter"
              autocomplete="off"
              required
            />
          </div>
        </div>
        <List loaded={notices_loaded} empty={notices_empty}>
          {#each notices_filtered as notice}
            <li>
              <Notice uid={notice.uid} title={notice.name} />
            </li>
          {/each}
        </List>
        <div class="flex justify-end mt-2">
          <button
            on:click={() => {
              send_notice_modal.show();
            }}
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mx-2 mb-2"
            >Send Notice</button
          >
        </div>
      {:else if tabs[4].active}
        {#if forum_thread_selected}
          <div class="flex align-center mb-2">
            <button
              on:click={() => {
                forum_thread_selected = false;
              }}
              type="button"
              class="font-medium text-blue-600 dark:text-blue-500 me-2"
            >
              <svg
                class="w-6 h-6"
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
                  d="m15 19-7-7 7-7"
                />
              </svg>
            </button>
            <p
              class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 p-0"
            >
              {selected_forum_thread.name}
            </p>
          </div>
          <div class="grow overflow-y-auto">
            <List loaded={true} empty={forum_messages.length === 0}>
              {#each forum_messages as message}
                <li class="me-1">
                  <ForumPost forum_id={selected_forum_thread.id} {message} />
                </li>
              {/each}
            </List>
          </div>
          <div class="flex justify-end mt-2">
            <button
              on:click={() => add_post_modal.show()}
              type="button"
              class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >Add Post</button
            >
          </div>
        {:else}
          <p
            class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
          >
            Forum
          </p>
          <div class="grow overflow-y-auto">
            <List loaded={true} empty={forum_threads.length === 0}>
              {#each forum_threads as forum_thread}
                <li>
                  <ForumThreadCard {forum_thread} {select_thread} />
                </li>
              {/each}
            </List>
          </div>
          <div class="flex justify-end mt-2">
            <button
              on:click={() => {
                add_forum_thread_modal.show();
              }}
              class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >Add Thread</button
            >
          </div>
        {/if}
      {/if}
    </div>
    <div class="thread-extra-button flex justify-end items-end mt-2">
      {#if tabs[0].active && is_logged_in}
        <button
          on:click={forward}
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          disabled={!can_forward}>Forward</button
        >
        <button
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          disabled={!can_forward}>Flex Forward</button
        >
        <button
          on:click={show_close_thread_modal}
          type="button"
          class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          disabled={!can_close}>Close Thread</button
        >
        <Dropdown>
          {#each forwardable_members as member}
            <DropdownItem key={member.id}>
              <input
                type="radio"
                name="selectedMember"
                value={member.id}
                bind:group={selected_memberid}
                id={"checkbox-" + member.id}
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for={"checkbox-" + member.id}
                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                {member.name}
              </label>
            </DropdownItem>
          {/each}
          <DropdownItem>
            <button
              on:click={flex_forward}
              type="button"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >Forward</button
            >
          </DropdownItem>
        </Dropdown>
      {:else if tabs[1].active}
        <!-- Add File -->
        <button
          on:click={add_file}
          type="button"
          class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >Add File</button
        >
      {:else if tabs[2].active}
        <!-- Add Members -->
        <button
          on:click={() => {
            add_member_modal.show();
          }}
          type="button"
          class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >Add Member</button
        >
      {/if}
    </div>
  </div>
</div>
{#if is_logged_in}
<AddMember bind:modal={add_member_modal} {get_addable_members} {add_member} />
<SendNotice bind:modal={send_notice_modal} {id} {send_notice_request} />
{/if}
<div
  bind:this={close_thread_modal_elem}
  id="close-thread-modal"
  data-modal-backdrop="static"
  tabindex="-1"
  aria-hidden="true"
  class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
>
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <!-- Modal header -->
      <div
        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Closing Thread
        </h3>
        <button
          on:click={hide_close_thread_modal}
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="p-4 md:p-5 space-y-4">
        <form on:submit={close_thread} class="mx-auto">
          <label
            for="message"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Closing Comment</label
          >
          <textarea
            bind:value={closing_comment}
            id="message"
            rows="3"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Leave a comment..."
            autocomplete="off"
          ></textarea>
          <div class="flex justify-end">
            <button
              type="submit"
              class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >Confirm</button
            >
          </div>
        </form>
      </div>
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

<div
  bind:this={add_forum_thread_modal_elem}
  data-modal-backdrop="static"
  tabindex="-1"
  aria-hidden="true"
  class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
>
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <!-- Modal header -->
      <div
        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Add Thread
        </h3>
        <button
          on:click={() => {
            add_forum_thread_modal.hide();
          }}
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <form
        bind:this={add_forum_thread_form}
        on:submit={add_forum_thread}
        action="javascript:"
        class="p-4 md:p-5 space-y-4"
      >
        <div class="mb-5">
          <label
            for="forum-thread-name"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Forum Thread Name</label
          >
          <input
            bind:value={forum_thread_name}
            type="text"
            id="forum-thread-name"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            autocomplete="off"
            required
          />
        </div>
        <div class="flex justify-end">
          <button
            type="submit"
            class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >Confirm</button
          >
        </div>
      </form>
    </div>
  </div>
</div>

<div
  bind:this={add_post_modal_elem}
  data-modal-backdrop="static"
  tabindex="-1"
  aria-hidden="true"
  class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
>
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <!-- Modal header -->
      <div
        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Add Post
        </h3>
        <button
          on:click={() => add_post_modal.hide()}
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <form
        bind:this={add_post_form}
        on:submit={post_message}
        action="javascript:"
        class="p-4 md:p-5 space-y-4"
      >
        <textarea
          bind:value={post_text}
          rows="4"
          class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="What's on your mind?"
          required
        ></textarea>
        <div class="flex justify-end">
          <button
            type="submit"
            class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >Confirm</button
          >
        </div>
      </form>
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
</style>
