<script lang="ts">
  import { goto } from "$app/navigation";
  import FileCard from "$lib/components/dashboard/file-card.svelte";
  import OrgCard from "$lib/components/dashboard/org-card.svelte";
  import TeamCard from "$lib/components/dashboard/team-card.svelte";
  import ThreadCard from "$lib/components/dashboard/thread-card.svelte";
  import { common_fetch } from "$lib/fetch_func";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { db, type PriveKey } from "$lib/db";
  import { logged_in_store, priv_key, uid, useremail } from "$lib/stores";
  import { Entity } from '$lib/containers';
    import List from "$lib/components/list.svelte";
    import { Modal } from "flowbite";

  /**
   * Whether profile edit mode active or not, toggled by button named "Edit Profile"
   */
  let profile_edit_mode: boolean = false;
  let username: string = "";
  let email: string = "";
  let pubkey: string = "";
  let privkey: string = "";
  /**
   * Visibility/truncated state of public key
   */
  let pubkey_truncate_status: string = "truncate";
  /**
   * Visibility/truncated state of private key
   */
  let privkey_visible: boolean = false;
  let pubkey_p: HTMLParagraphElement;
  let privkey_p: HTMLParagraphElement;
  /**
   * Decides which tab to show according to these values:
   *
   * 0 -> personal files
   *
   * 1 -> work files
   *
   * 2 -> organizations
   *
   * 3 -> teams
   *
   * 4 -> threads
   */
  let tab_index: number = 0;

  /**
   * This class helps to set tab properties and their functionalities easily 👉👈
   */
  class Tab {
    public name!: string;
    /**
     * this callback is supposed to set tab_index
     */
    public callback!: () => void;
  }

  let tabs: Tab[] = [
    {
      name: "Personal Files",
      callback: (): void => {
        tab_index = 0;
      },
    },
    {
      name: "Work Files",
      callback: (): void => {
        tab_index = 1;
      },
    },
    {
      name: "Organizations",
      callback: (): void => {
        tab_index = 2;
      },
    },
    {
      name: "Teams",
      callback: (): void => {
        tab_index = 3;
      },
    },
    {
      name: "Threads",
      callback: (): void => {
        tab_index = 4;
      },
    },
  ];
  let cng_pass_modal_elem: HTMLDivElement;
  let cng_pass_modal: Modal;

  /**
   * toggle to profile edit mode
   */
  function edit_profile(): void {
    profile_edit_mode = true;
  }

  /**
   * save profile to db after edit
   */
  function save_profile(): void {
    profile_edit_mode = false;
  }

  /**
   * toggle public key visibility
   */
  function switch_pubkey_truncate(): void {
    if (pubkey_truncate_status === "truncate") {
      pubkey_truncate_status = "";
    } else {
      pubkey_truncate_status = "truncate";
    }
  }

  /**
   * toggle private key visibility
   */
  function switch_privkey_visibility(): void {
    privkey_visible = !privkey_visible;
  }
  class File {
    public id!: string;
    public name!: string;
    public type!: string;
  }

  let personal_files: File[] = new Array(0);
  function get_personal_files(): void {
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
      }
    );
  }
  let work_files: File[] = new Array(0);
  function get_work_files(): void {
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/getworkfiles",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        work_files = [];

        if (response_obj === null) {
          return;
        }
        console.log(response_obj);

        for (let i: number = 0; i < response_obj.length; ++i) {
          work_files[i] = new File();
          work_files[i].id = response_obj[i].f_fileid;
          work_files[i].name = response_obj[i].f_filename;
          work_files[i].type = response_obj[i].f_file_extension;
        }
      }
    );
  }

  class Team {
    public name!: string;
    public id!: string;
  }
  class Org {
    public name!: string;
    public id!: string;
  }

  let teams: Team[] = new Array(5);

  for (let i: number = 0; i < teams.length; ++i) {
    teams[i] = new Team();
    teams[i].name = "Team " + (i + 1).toString();
    teams[i].id = String(i);
  }

  /**
   * thread list item
   */
  class Thread {
    public name!: string;
    public id!: string;
  }

  let threads: Thread[] = new Array(10);
  function get_user_teams(): void {
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
        // console.log(response_obj);
        for (let i: number = 0; i < response_obj.length; ++i) {
          teams[i] = new Team();
          teams[i].name = response_obj[i].f_team_name;
          teams[i].id = response_obj[i].f_teamid;
        }
      }
    );
  }
  function get_user_all_threads(): void {
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/getallthreads",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();

        threads = [];

        if (response_obj === null) {
          return;
        }
        console.log(response_obj);
        for (let i: number = 0; i < response_obj.length; ++i) {
          threads[i] = new Thread();
          threads[i].name = response_obj[i].f_threadname;
          threads[i].id = response_obj[i].f_threadid;
        }
      }
    );
  }
  let orgs: Entity[] = [];
  function get_user_orgs(): void {
    let request_obj: any = {
      given_userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/getorgs",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();
        if (response_obj === null) {
          return;
        }
        console.log(response_obj);
        for (let i: number = 0; i < response_obj.length; ++i) {
          orgs[i] = new Entity();
          orgs[i].name = response_obj[i].f_org_name;
          orgs[i].uid = response_obj[i].f_orgid;
        }
      }
    );
  }


  onMount((): void => {
    cng_pass_modal = new Modal(cng_pass_modal_elem);

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
    get_user_all_threads();
    get_user_orgs();
    get_work_files();
    let request_obj: any = {
      userid: $page.data.session?.user?.name,
    };

    common_fetch(
      "/api/user/details",
      request_obj,
      async (response: Response): Promise<void> => {
        let response_obj: any = await response.json();
        // console.log(response_obj);
        username = response_obj.username;
        email = response_obj.email;
        // console.log(typeof response_obj.publickey);
        pubkey = [
          ...new Uint8Array(
            new TextEncoder().encode(JSON.stringify(response_obj.publickey))
          ),
        ]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
        // console.log(pubkey);
        if ($page.data.session) {
          let temp_priv_key = await db.priv_key.get(
            $page.data.session.user?.name as string
          );
          if (temp_priv_key) {
            let subtle_crypto: SubtleCrypto = window.crypto.subtle;
            let private_key = await subtle_crypto.exportKey(
              "jwk",
              temp_priv_key.key
            );
            // console.log(private_key);
            privkey = [
              ...new Uint8Array(
                new TextEncoder().encode(JSON.stringify(private_key))
              ),
            ]
              .map((x) => x.toString(16).padStart(2, "0"))
              .join("");
          }
        }
      }
    );
  });

  async function regenkey(): Promise<void> {
    if ($page.data.session?.user) {
      let subtle_crypto: SubtleCrypto = window.crypto.subtle;

      let keyPair = await subtle_crypto.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-384",
        },
        true,
        ["sign", "verify"]
      );

      let public_key = await subtle_crypto.exportKey("jwk", keyPair.publicKey);

      await db.priv_key.put({
        id: $page.data.session.user?.name as string,
        key: keyPair.privateKey,
      });

      let request_obj: any = {
        user_id: $page.data.session?.user?.name,
        key: JSON.stringify(public_key),
      };
      common_fetch(
        "/api/user/addkey",
        request_obj,
        async (response: Response): Promise<void> => {
          // new_key.set(false);
          console.log("layout add key response:", response);
          localStorage.setItem("new_key", "0");
          localStorage.setItem("pub_key", JSON.stringify(public_key));
        }
      );

      let temp_key: PriveKey | undefined = await db.priv_key.get($page.data.session.user?.name as string);

            if(temp_key)
            {
                priv_key.set(temp_key.key);
            }
    }
  }
</script>

<svelte:head>
    <title>{username} Profile</title> 
</svelte:head>

<!-- Dashboard card root div -->
<div
  class="dash-root"
>
  <div class="dash-container block bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <!-- This segment shows the profile info and keys -->
    <div class="dash-left my-6 ps-6 pe-3">
      <!-- Pfp -->
      <div class="flex items-center">
        <img
          class="w-36 h-36 rounded-full"
          src="pochita.webp"
          alt="Rounded avatar"
        />

        {#if profile_edit_mode}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <button
            class="inline-flex items-center font-medium text-blue-700 dark:text-blue-600 hover:underline ms-2"
          >
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"
              />
              <path
                d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z"
              />
              <path
                d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z"
              />
            </svg>
          </button>
        {/if}
      </div>
      <!-- Username -->
      {#if profile_edit_mode}
        <p class="text-base font-medium text-gray-500 dark:text-gray-400 mt-2">
          Username
        </p>
        <input
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-2 mb-6"
          bind:value={username}
          required
        />
      {:else}
        <p
          class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-2 mb-6"
        >
          {username}
        </p>
      {/if}
      <!-- Email ID -->
      <p class="text-base font-medium text-gray-500 dark:text-gray-400 mt-2">
        Email
      </p>
      {#if profile_edit_mode}
        <input
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-2 mb-6"
          bind:value={email}
          required
        />
      {:else}
        <p class="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">
          {email}
        </p>
      {/if}
      <!-- Edit/save profile button -->
      {#if profile_edit_mode}
        <div class="flex">
          <button
            type="button"
            class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            on:click={save_profile}>Save</button
          >
          <button on:click={() => cng_pass_modal.show()} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Change Password</button>
        </div>
      {:else}
        <button
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          on:click={edit_profile}>Edit Profile</button
        >
      {/if}
      <!-- Public key -->
      <p class="text-base font-medium text-gray-500 dark:text-gray-400 mt-6">
        Public Key
      </p>
      <div class="flex items-start mb-2" style="max-width: 100%;">
        <p
          class="text-xl font-medium text-gray-700 dark:text-gray-200 {pubkey_truncate_status} mt-auto mb-auto"
          style="width: 10em; word-wrap: break-word;"
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
      <!-- private key -->
      <p class="text-base font-medium text-gray-500 dark:text-gray-400">
        Private Key
      </p>
      <div class="flex items-start mb-4">
        <p
          class="text-xl font-medium text-gray-700 dark:text-gray-200 mt-auto mb-auto"
          style="width: 10em; word-wrap: break-word;"
          bind:this={privkey_p}
        >
          {#if privkey_visible}
            {privkey}
          {:else}
            ●●●●●●●●●●
          {/if}
        </p>
        <!-- Show/hide private key button -->
        <button
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ms-2"
          on:click={switch_privkey_visibility}
        >
          {#if privkey_visible}
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
          {:else}
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
          {/if}
        </button>
      </div>
      <!-- Regenerate keys button -->
      <button
        type="button"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        on:click={regenkey}>Regenerate Keys</button
      >
    </div>
    <!-- This segment shows various lists like files orgs etc -->
    <div class="dash-right my-6 ps-3 me-6">
      <!-- svelte-ignore a11y-invalid-attribute -->
      <ul
        class="tab-list flex justify-center text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-2"
      >
        {#each tabs as tab, index}
          <li class="me-2">
            {#if tab_index === index}
              <a
                href="javascript:"
                class="inline-block px-4 py-3 text-white bg-blue-600 rounded-lg active"
                aria-current="page">{tab.name}</a
              >
            {:else}
              <a
                href="javascript:"
                class="inline-block px-4 py-3 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
                on:click={tab.callback}>{tab.name}</a
              >
            {/if}
          </li>
        {/each}
      </ul>
      <!-- Main content of each tab -->
      <div class="tab-content">
        <!-- Each option of tab_index show each type of tab -->
        {#if tab_index === 0}
          <List loaded={true} empty={personal_files.length === 0}>
            {#each personal_files as file}
              <li>
                <FileCard file_id={file.id} file_name={file.name} file_type={file.type} />
              </li>
            {/each}
          </List>
        {:else if tab_index === 1}
        <List loaded={true} empty={work_files.length === 0}>
          {#each work_files as file}
            <li>
              <FileCard file_id={file.id} file_name={file.name} file_type={file.type} />
            </li>
          {/each}
        </List>
        {:else if tab_index === 2}
          <List loaded={true} empty={orgs.length === 0}>
            {#each orgs as org}
              <li>
                <OrgCard org_id={org.uid} org_name={org.name} />
              </li>
            {/each}
          </List>
        {:else if tab_index === 3}
          <List loaded={true} empty={teams.length === 0}>
            {#each teams as team}
              <li>
                <TeamCard team_name={team.name} team_id={team.id} />
              </li>
            {/each}
          </List>
        {:else if tab_index === 4}
          <List loaded={true} empty={threads.length === 0}>
            {#each threads as thread}
              <li>
                <ThreadCard thread_name={thread.name} thread_id={thread.id} />
              </li>
            {/each}
          </List>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Main modal -->
<div bind:this={cng_pass_modal_elem} data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-2xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Change Password
                </h3>
                <button on:click={() => cng_pass_modal.hide()} type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- Modal body -->
            <form class="p-4 md:p-5 space-y-4">
              <div class="mb-5">
                <label for="cng-pass-old" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current Password</label>
                <input type="password" id="cng-pass-old" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
              </div>
              <div class="mb-5">
                <label for="cng-pass-new" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                <input type="password" id="cng-pass-old" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
              </div>
              <div class="mb-5">
                <label for="cng-pass-confirm" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
                <input type="password" id="cng-pass-old" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
              </div>
              <div class="flex justify-end">
                <button type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Confirm</button>
              </div>
            </form>
        </div>
    </div>
</div>


<style>
  .dash-root {
    position: absolute;
    top: 5.25rem;
    bottom: 1rem;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .dash-container
  {
    width: 75rem;
    height: 100%;
    display: flex;
    align-items: stretch;
  }
  .dash-left {
    overflow-y: auto;
  }
  .dash-right {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  .tab-content {
    overflow-y: auto;
  }
</style>
