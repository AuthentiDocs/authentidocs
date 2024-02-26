<script lang="ts">
	import Notice from './../../../lib/components/notice.svelte';
  import { Modal } from "flowbite";
  import { page } from "$app/stores";
  import FileCard from "$lib/components/home/file-card.svelte";
  import TeamCard from "$lib/components/home/team-card.svelte";
  import ThreadCard from "$lib/components/home/thread-card.svelte";
  import { goto } from "$app/navigation";
  import { logged_in_store, priv_key, useremail, uid } from "$lib/stores";
  import { get } from "svelte/store";
  import { common_fetch } from "$lib/fetch_func";
  import { onMount } from "svelte";

  import { Entity, type Member } from '$lib/containers';


  let file_input_elem: HTMLInputElement;
  let modal_elem: HTMLDivElement;
  let modal_obj: Modal;
  let modal_show: boolean = false;
  let uploading: boolean = false;
  let upload_progress_elem: HTMLDivElement;

  /**
   * Decides which tab to show according to these values:
   *
   * 0 -> my personal files
   *
   * 1 -> my teams
   *
   * 2 -> active threads
   *
   * 3 -> archived threads
   *
   * 4 -> notices
   */
  let tab_index: number = 0;
  let color: string[] = new Array(5).fill("bg-white dark:bg-gray-800");

  function reset_color(): void {
    color.map((value: string, index: number, array: string[]): void => {
      array[index] = "bg-white dark:bg-gray-800";
    });
  }

  /**
   * tab list element data object
   */
  class Tab {
    public name!: string;
    /**
     * this callback is supposed to set tab_index
     */
    public callback!: () => void;
  }

  let tabs: Tab[] = new Array(5);

  for (let i: number = 0; i < tabs.length; ++i) {
    tabs[i] = new Tab();

    tabs[i].callback = (): void => {
      reset_color();

      color[i] = "bg-gray-200 dark:bg-gray-600";
      tab_index = i;
    };
  }

  tabs[0].name = "My Personal Files";
  tabs[1].name = "My Teams";
  tabs[2].name = "Active Threads";
  tabs[3].name = "Archived Threads";
  tabs[4].name = "Notices";

  /**
   * file list element data object
   */
  class File {
    public id!: string;
    public name!: string;
    public type!: string;
  }

  let personal_files: File[] = [];
  let personal_files_empty: boolean;
  let personal_files_loaded: boolean = false;

  $: personal_files_empty = personal_files.length === 0;

  /**
   * team list element data object
   */
  class Team {
    public name!: string;
    public id!: string;
  }

  let teams: Team[] = [];
  let teams_loaded: boolean = false;
  let teams_empty: boolean;

  $: teams_empty = teams.length === 0;

  /**
   * thread list item
   */
  class Thread {
    public name!: string;
    public id!: string;
  }

  let act_threads: Thread[] = [];
  let act_thread_loaded: boolean = false;
  let act_thread_empty: boolean;

  $: act_thread_empty = act_threads.length === 0;

  let arch_threads: Thread[] = [];
  let arch_thread_loaded: boolean = false;
  let arch_thread_empty: boolean;

  $: arch_thread_empty = arch_threads.length === 0;

  function show_modal(): void {
    modal_obj.show();
  }

  function hide_modal(): void {
    modal_obj.hide();
  }
  let notices: Entity[] = [];
  function get_notices(): void
    {
        let request_obj: any = {
            userid: $page.data.session?.user?.name,
        };

        common_fetch(
        "/api/user/getnotices",
        request_obj,
        async (response: Response): Promise<void> => {
            let response_obj: any = await response.json();

            if (response_obj === null) {
            return;
            }
            console.log(response_obj)
            notices = new Array((response_obj.length));
            for(let i = 0; i < notices.length; ++i)
        {
            notices[i] = new Entity();
            notices[i].uid = response_obj[i].f_noticeid;
            notices[i].name = response_obj[i].f_content;
            if(notices[i].name.length>10) notices[i].name = notices[i].name.substring(0,10) + "...."
        }
    });
    }
  function get_personal_files(): void {
    personal_files_loaded = false;
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/files/getpersonalfiles",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        personal_files = [];

        if (response_obj === null) {
          return;
        }

        for (let i: number = 0; i < response_obj.length; ++i) {
          personal_files[i] = new File();
          personal_files[i].id = response_obj[i].f_fileid;
          personal_files[i].name = response_obj[i].f_filename;
          personal_files[i].type = response_obj[i].f_file_extension;
        }

        // these should stay for testing
        // let test_count = 10;
        // personal_files = new Array(test_count);

        // for (let i: number = 0; i < test_count; ++i) {
        //   personal_files[i] = new File();
        //   personal_files[i].id = (i + 1).toString();
        //   personal_files[i].name = "File " + (i + 1);
        //   personal_files[i].type = "png";
        // }

        personal_files_loaded = true;
      },
    );
  }
  function get_user_teams(): void {
    teams_loaded = false;
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/getteams",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        teams = [];

        if (response_obj === null) {
          return;
        }

        for (let i: number = 0; i < response_obj.length; ++i) {
          teams[i] = new Team();
          teams[i].name = response_obj[i].f_team_name;
          teams[i].id = response_obj[i].f_teamid;
        }

        // these should stay for testing
        // let test_count = 10;
        // teams = new Array(test_count);

        // for (let i: number = 0; i < test_count; ++i) {
        //   teams[i] = new Team();
        //   teams[i].id = (i + 1).toString();
        //   teams[i].name = "Team " + (i + 1);
        // }

        teams_loaded = true;
      },
    );
  }
  function get_user_active_threads(): void {
    act_thread_loaded = false;
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/getactivethreads",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        act_threads = [];

        if (response_obj === null) {
          return;
        }

        for (let i: number = 0; i < response_obj.length; ++i) {
          act_threads[i] = new Thread();
          act_threads[i].name = response_obj[i].f_threadname;
          act_threads[i].id = response_obj[i].f_threadid;
        }

        // these should stay for testing
        let test_count = 10;
        act_threads = new Array(test_count);

        for (let i: number = 0; i < test_count; ++i) {
          act_threads[i] = new Thread();
          act_threads[i].id = (i + 1).toString();
          act_threads[i].name = "Thread " + (i + 1);
        }

        act_thread_loaded = true;
      },
    );
  }
  function get_user_archive_threads(): void {
    arch_thread_loaded = false;
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/getarchivethreads",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        arch_threads = [];

        if (response_obj === null) {
          return;
        }

        for (let i: number = 0; i < response_obj.length; ++i) {
          arch_threads[i] = new Thread();
          arch_threads[i].name = response_obj[i].f_threadname;
          arch_threads[i].id = response_obj[i].f_threadid;
        }

        // these should stay for testing
        let test_count = 10;
        arch_threads = new Array(test_count);

        for (let i: number = 0; i < test_count; ++i) {
          arch_threads[i] = new Thread();
          arch_threads[i].id = (i + 1).toString();
          arch_threads[i].name = "Thread " + (i + 1);
        }

        arch_thread_loaded = true;
      },
    );
  }

  async function upload(event: Event): Promise<void> {
    if (file_input_elem.value === "") {
      return;
    }

    if (file_input_elem.files === null) {
      return;
    }

    let file: globalThis.File = file_input_elem.files[0];

    if (file === null) {
      return;
    }

    let file_buffer: ArrayBuffer = await file.arrayBuffer();
    file_input_elem.value = "";

    uploading = true;
    let success: boolean = true;
    let file_success_response_obj: any = {};

    for (let i: number = 0; i < file_buffer.byteLength; i += 1048576) {
      let smallbuffer: ArrayBuffer = file_buffer.slice(i, i + 1048576);
      let small_array: number[] = Array.from(new Uint8Array(smallbuffer));
      let response: Response = await fetch(
        "/api/files/addchunkfile/continue?filename=" + file.name,
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

      console.log(response_obj);

      if (response_obj.success === false) {
        console.error("dhuru");

        success = false;

        break;
      }

      upload_progress_elem.style.width =
        Math.round((i * 100) / file_buffer.byteLength) + "%";
    }
    if (success) {
      upload_progress_elem.style.width = "100%";

      await fetch("/api/files/addchunkfile/finish?filename=" + file.name, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then(async (response: Response): Promise<void> => {
        file_success_response_obj = await response.json();

        console.log("file upload shesh:line223", file_success_response_obj);
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

      uploading = false;

      modal_obj.hide();
      get_personal_files();
    }
  }

  onMount((): void => {
    if ($page.data.session === null) {
      goto("/");

      return;
    } else {
      logged_in_store.set(true);
      uid.set($page.data.session?.user?.name as string);
      useremail.set($page.data.session?.user?.email as string);
    }

    get_personal_files();
    get_user_teams();
    get_user_active_threads();
    get_user_archive_threads();
    get_notices();

    modal_obj = new Modal(modal_elem);

    tabs[0].callback();
  });
</script>

<div class="pg-center">
  <div class="pg-container">
    <!-- Select Tabs to see various lists -->
    <div
      class="pg-left block bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-6"
    >
      <div class="tab-options">
        <ul class="space-y-2 pb-1">
          <!-- My personal files -->
          <li>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="javascript:"
              class="flex {color[0]} items-center block p-6 border border-gray-200 rounded-lg shadow dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              on:click={tabs[0].callback}
            >
              <svg
                class="w-8 h-8 text-blue-500 dark:text-blue-400 me-2"
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
                  d="m4 12 8-8 8 8M6 10.5V19c0 .6.4 1 1 1h3v-3c0-.6.4-1 1-1h2c.6 0 1 .4 1 1v3h3c.6 0 1-.4 1-1v-8.5"
                />
              </svg>
              <p
                class="text-2xl font-semibold text-gray-700 dark:text-gray-200"
              >
                My Personal Files
              </p>
            </a>
          </li>
          <!-- My teams -->
          <li>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="javascript:"
              class="flex {color[1]} items-center block p-6 border border-gray-200 rounded-lg shadow dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              on:click={tabs[1].callback}
            >
              <svg
                class="w-8 h-8 text-green-500 dark:text-green-400 me-2"
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
                class="text-2xl font-semibold text-gray-700 dark:text-gray-200"
              >
                My Teams
              </p>
            </a>
          </li>
          <!-- active threads -->
          <li>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="javascript:"
              class="flex {color[2]} items-center block p-6 border border-gray-200 rounded-lg shadow dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              on:click={tabs[2].callback}
            >
              <svg
                class="w-8 h-8 text-indigo-500 dark:text-indigo-400 me-2"
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
                  d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8"
                />
              </svg>
              <p
                class="text-2xl font-semibold text-gray-700 dark:text-gray-200"
              >
                Active Threads ({act_threads.length})
              </p>
            </a>
          </li>
          <!-- Archived Threads -->
          <li>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="javascript:"
              class="flex {color[3]} items-center block p-6 border border-gray-200 rounded-lg shadow dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              on:click={tabs[3].callback}
            >
              <svg
                class="w-8 h-8 text-yellow-500 dark:text-yellow-400 me-2"
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
                  d="M13.5 8H4m0-2v13c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V9c0-.6-.4-1-1-1h-5a1 1 0 0 1-.8-.4l-1.9-2.2a1 1 0 0 0-.8-.4H5a1 1 0 0 0-1 1Z"
                />
              </svg>
              <p
                class="text-2xl font-semibold text-gray-700 dark:text-gray-200"
              >
                Archived Threads
              </p>
            </a>
          </li>
          <!-- Notices -->
          <li>
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              href="javascript:"
              class="flex {color[4]} items-center block p-6 border border-gray-200 rounded-lg shadow dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              on:click={tabs[4].callback}
            >
              <svg
                class="w-8 h-8 text-red-500 dark:text-red-400 me-2"
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
                  d="M12 5.4V3m0 2.4a5.3 5.3 0 0 1 5.1 5.3v1.8c0 2.4 1.9 3 1.9 4.2 0 .6 0 1.3-.5 1.3h-13c-.5 0-.5-.7-.5-1.3 0-1.2 1.9-1.8 1.9-4.2v-1.8A5.3 5.3 0 0 1 12 5.4ZM8.7 18c.1.9.3 1.5 1 2.1a3.5 3.5 0 0 0 4.6 0c.7-.6 1.3-1.2 1.4-2.1h-7Z"
                />
              </svg>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                Notices
              </p>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div
      class="pg-right block bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ms-5 p-6"
    >
      {#if tab_index === 0}
        <p
          class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
        >
          My Personal Files
        </p>
        <List loaded={personal_files_loaded} empty={personal_files_empty}>
          {#each personal_files as file}
            <li>
              <FileCard
                file_id={file.id}
                file_name={file.name}
                file_type={file.type}
              />
            </li>
          {/each}
        </List>
        <div class="list-upload flex justify-end mt-2">
          <div class="flex flex-col justify-end">
            <button
              on:click={show_modal}
              type="button"
              class="shrink text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 m-0 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >Upload</button
            >
          </div>
        </div>
      {:else if tab_index === 1}
        <p
          class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
        >
          My Teams
        </p>
        <List loaded={teams_loaded} empty={teams_empty}>
          {#each teams as team}
            <li>
              <TeamCard team_name={team.name} team_id={team.id} />
            </li>
          {/each}
        </List>
      {:else if tab_index === 2}
        <p
          class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
        >
          Active Threads
        </p>
        <List loaded={act_thread_loaded} empty={act_thread_empty}>
          {#each act_threads as thread}
            <li>
              <ThreadCard thread_name={thread.name} thread_id={thread.id} />
            </li>
          {/each}
        </List>
      {:else if tab_index === 3}
        <p
          class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
        >
          Archived Threads
        </p>
        <List loaded={arch_thread_loaded} empty={arch_thread_empty}>
          {#each arch_threads as thread}
            <li>
              <ThreadCard thread_name={thread.name} thread_id={thread.id} />
            </li>
          {/each}
<
        </ul>
      </div>
      {:else if tab_index === 4}
      <div class="list-container m-6">
        <p
          class="list-title text-2xl font-bold text-gray-700 dark:text-gray-200 pb-3 ps-1"
        >
          Notices
        </p>
        <ul class="list-elements space-y-2 pb-2" style="overflow-y: auto;">
          {#each notices as notice}
              <li>
                  <Notice uid={notice.uid} title={notice.name} />
              </li>
          {/each}
      </ul>
      </div>
    {/if}
  </div>
</div>
<div
  bind:this={modal_elem}
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
          {#if uploading}
            Uploading...
          {:else}
            File Upload
          {/if}
        </h3>
        {#if !uploading}
          <button
            on:click={hide_modal}
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide="static-modal"
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
        {/if}
      </div>
      <!-- Modal body -->
      <div class="p-4 md:p-5 space-y-4">
        <div class="flex items-center justify-center w-full">
          {#if uploading}
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                bind:this={upload_progress_elem}
                class="bg-blue-600 h-2.5 rounded-full"
                style="width: 0%"
              ></div>
            </div>
          {:else}
            <label
              for="dropzone-file"
              class="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Click to upload</span> or drag and
                  drop
                </p>
              </div>
              <input
                bind:this={file_input_elem}
                on:input={upload}
                id="dropzone-file"
                type="file"
                class="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .pg-center {
    position: absolute;
    top: 5.5rem;
    bottom: 1rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .pg-container {
    width: 75rem;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  .tab-options
  {
    height: 100%;
    overflow-y: auto;
  }
  .pg-right {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .list-elements {
    overflow-y: auto;
    flex-grow: 1;
  }
  @media (max-width: 1231px) {
    .pg-container {
      width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
</style>
