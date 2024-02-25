<script lang="ts">
    import { page } from "$app/stores";

    class FileData
    {
        public id: string = "";
        public name: string = "";
        public date: Date = new Date(0);
        public size: number = -1;
    }

    let type: string;
    let files: FileData[] = [];
    let file_loaded: boolean = false;
    let loading: boolean = false;

    function submit(): void
    {
        file_loaded = false;
        loading = true;

        fetch("/api/filter",
        {
            method: "POST",
            body: JSON.stringify(
            {
                type: type
            })
        }).then(async (response: Response): Promise<void> =>
        {
            let response_obj: any = await response.json();

            if(response_obj.success === 0)
            {
                files = new Array(response_obj.files.length);

                for(let i: number = 0; i < files.length; ++i)
                {
                    files[i] = new FileData();
                }

                for(let i: number = 0; i < files.length; ++i)
                {
                    files[i].id = response_obj.files[i].__id;
                    files[i].name = response_obj.files[i].__filename;
                    files[i].date = new Date(response_obj.files[i].__date);
                    let file_url_response: Response = await fetch("/api/files/getfilelink",
                    {
                        method: "POST",
                        body: JSON.stringify(
                        {
                            fileid: files[i].id,
                            user_id: $page.data.session?.user?.name
                        })
                    });
                    let file_url = (await file_url_response.json()).file_link_download;
                    let file_blob_response: Response = await fetch(file_url, {method: "GET"});
                    let blob: Blob = await file_blob_response.blob();
                    files[i].size = blob.size;
                    files[i].size = 10;
                }

                file_loaded = true;
            }
            else
            {
                console.error(response_obj.success);
            }

            loading = false;
        });
    }
</script>

<div class="p-6">
    <form class="flex mb-2" action="javascript:" on:submit={submit}>
        <input bind:value={type} type="text" id="file-type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ms-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Filter</button>
    </form>
    {#if file_loaded}
        <div class="relative overflow-x-auto">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Type
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Size
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each files as file}
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td>
                                {file.name}
                            </td>
                            <td class="px-6 py-4">
                                {file.date.toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4">
                                {file.size}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {:else if loading}
        <div class="flex justify-center" role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
    {/if}
</div>
