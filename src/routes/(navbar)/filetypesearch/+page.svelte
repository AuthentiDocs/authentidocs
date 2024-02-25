<script lang="ts">
  import { common_fetch } from "$lib/fetch_func";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
  import FileCard from "$lib/components/home/file-card.svelte";

  class File {
    public id!: string;
    public name!: string;
    public type!: string;
  }
  let personal_files: File[] = new Array(0);
  $: personal_files_length = personal_files.length;

  function other_search(): void {
    let userid = $page.data.session?.user?.name;
    common_fetch(
      "/api/files/getpersonalfiles_extension",
      {
        given_file_extension: "",
        given_userid: userid,
      },
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
  function pdf_search(): void {
    let userid = $page.data.session?.user?.name;
    common_fetch(
      "/api/files/getpersonalfiles_extension",
      {
        given_file_extension: "pdf",
        given_userid: userid,
      },
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
  function text_search(): void {
    let userid = $page.data.session?.user?.name;
    common_fetch(
      "/api/files/getpersonalfiles_extension",
      {
        given_file_extension: "txt",
        given_userid: userid,
      },
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
  function csv_search(): void {
    let userid = $page.data.session?.user?.name;
    common_fetch(
      "/api/files/getpersonalfiles_extension",
      {
        given_file_extension: "csv",
        given_userid: userid,
      },
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

  onMount((): void => {});
</script>

<div class="notice-root">
  <div
    class="notice-root-card block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="list-item">
      <Button>Dropdown button</Button>
      <Dropdown>
        <DropdownItem
          ><Button on:click={pdf_search}>Pdfs</Button>
        </DropdownItem>
        <DropdownItem
          ><Button on:click={text_search}>Text</Button></DropdownItem
        >
        <DropdownItem
          ><Button on:click={csv_search}>CSVs</Button></DropdownItem
        >
        <DropdownItem
          ><Button on:click={other_search}>Others</Button></DropdownItem
        >
      </Dropdown>
    </div>
    <div class="notice-message">
      <p class="text-gray-700 dark:text-gray-200 mb-4">Files</p>
    </div>
    <div class="list-container m-6">
      {#if personal_files_length > 0}
        <ul class="list-elements space-y-2 pb-1 pe-1" style="overflow-y: auto;">
          {#each personal_files as file}
            <li>
              <FileCard
                file_id={file.id}
                file_name={file.name}
                file_type={file.type}
              />
            </li>
          {/each}
        </ul>
      {:else}
        <div
          class="list-empty flex justify-center p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
          role="alert"
        >
          <p>Wow! Such empty *_*</p>
        </div>
      {/if}
    </div>
    <div class="flex justify-end mt-2"></div>
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
  .notice-message {
    flex-grow: 1;
    overflow-y: auto;
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
