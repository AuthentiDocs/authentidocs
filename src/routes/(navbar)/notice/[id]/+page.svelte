<script lang="ts">
    import { common_fetch } from "$lib/fetch_func";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    let id: string;
    let title: string = "Ekta Notice";
    let sender: string = "Ekjon Sender";
    let subject: string = "Ekta kotha chilo";
    let content: string = "hehe";
    
    function get_notice_details(): void
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
            title = content;
            if(content.length > 10) title = title.substring(0,10)+"....";
        });
    }

onMount((): void =>
    {
        id = $page.params.id;
        get_notice_details();
    });
</script>

<div class="notice-root">
    <div class="notice-root-card block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div class="notice-card-content">
            <p class="text-3xl font-bold text-gray-700 dark:text-gray-200">{title}</p>
            <p class="text-gray-500 dark:text-gray-400 mb-2">Sent By: {sender}</p>
            <p class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Subject: {subject}</p>
        </div>
        <div class="notice-message">
            <p class="text-gray-700 dark:text-gray-200 mb-4">{content}</p>
        </div>
        <div class="flex justify-end mt-2">
            <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 me-2">Viewer Signature</button>
            <button type="button" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Done</button>
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