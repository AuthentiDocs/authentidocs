<script lang="ts">
    import { ForumMessage } from "$lib/containers";
    import ForumPost from "$lib/components/thread/forum-post.svelte";
    import { make_date, make_time } from "$lib/helpers";

    export let forum_id: string;
    export let message: ForumMessage;
    let children: ForumMessage[] = [];
    let reply_mode: boolean = false;
    let created_date: string;
    let created_time: string;
    let child_message: string;
    let reply_form_elem: HTMLFormElement;
    let showing_more: boolean = false;

    function add_post(): void
    {
        fetch("/api/forum/addchildposts",
        {
            method: "POST",
            body: JSON.stringify(
            {
                thread_name: forum_id,
                parent_id: message.id,
                content: child_message
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                get_posts(message.id);
            }
            else
            {
                console.error(response.status, response.statusText);
            }

            reply_mode = false;

            reply_form_elem.reset();
            child_message = "";
        });
    }

    function get_posts(id: string): void
    {
        fetch("/api/forum/getpost",
        {
            method: "POST",
            body: JSON.stringify(
            {
                postid: message.id
            })
        }).then(async (response: Response): Promise<void> =>
        {
            if(response.status === 200)
            {
                let response_obj: any = await response.json();
                
                if(response_obj.children)
                {
                    children = new Array(response_obj.children.length);

                    for(let i: number = 0; i < children.length; ++i)
                    {
                        children[i] = new ForumMessage();
                        children[i].id = response_obj.children[i].postid;
                        children[i].created_at = new Date(response_obj.children[i].created_at);
                        children[i].sender = response_obj.children[i].creator_id;
                        children[i].content = response_obj.children[i].post_content;
                    }
                }
            }
            else
            {
                console.error(response.status, response.statusText);
            }
        });
    }

    function show_more(): void
    {
        showing_more = true;

        get_posts(message.id);
    }

    function show_less(): void
    {
        showing_more = false;
    }

    $:
    {
        get_posts(message.id);
    }

    $:
    {
        created_date = make_date(message.created_at);
        created_time = make_time(message.created_at);
    }
</script>

<div class="flex items-start gap-2.5">
    <img class="w-8 h-8 rounded-full" src="/pochita.webp" alt="alt-img">
    <div class="w-full">
        <div class="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{message.sender}</span>
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{created_time} • {created_date}</span>
            </div>
            <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message.content}</p>
            <div class="flex justify-end">
                {#if reply_mode}
                    <form bind:this={reply_form_elem} on:submit={add_post} action="javascript:" class="w-full">
                        <textarea bind:value={child_message} rows="1" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" autocomplete="off" required></textarea>
                        <div class="flex justify-end mt-2">
                            <button type="submit" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Post</button>
                            <button on:click={() => {reply_mode = false;}} type="button" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Cancel</button>
                        </div>
                    </form>
                {:else}
                    {#if children.length > 0}
                        {#if showing_more}
                            <button on:click={() => show_less()} class="font-medium text-blue-600 dark:text-blue-500 hover:underline me-2">Less</button>
                        {:else}
                            <button on:click={() => show_more()} class="font-medium text-blue-600 dark:text-blue-500 hover:underline me-2">More</button>
                        {/if}
                    {/if}
                    <button on:click={() => {reply_mode = true;}} class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Reply</button>
                {/if}
            </div>
        </div>
        {#if showing_more && children.length > 0}
            <div class="mt-2">
                {#each children as message, idx}
                    <div class={(idx < children.length - 1) ? "mb-2" : ""}>
                        <ForumPost forum_id={forum_id} message={message} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>