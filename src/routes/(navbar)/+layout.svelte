<script lang="ts">
    import "../../app.pcss";
    import Navbar from "$lib/components/navbar.svelte";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { source } from "sveltekit-sse";
    import { get, type Readable, type Subscriber } from "svelte/store";
    import { get_notifications } from "$lib/notification";

    let noti_json: Readable<any>;

    $: 
    {
        if(!($noti_json === null || $noti_json === undefined))
        {
            get_notifications($page.data.session?.user?.name);

            if(Notification.permission === "granted")
            {
                for(let i: number = 0; i < $noti_json.length; ++i)
                {
                    new Notification($noti_json[i].f_content);
                }
            }
        }
    }

    onMount(async (): Promise<void> => {
        if(Notification.permission !== "granted")
        {
            await Notification.requestPermission();
        }

        if ($page.data.session) {
            let notification = source("/api/user/notificationevent");
            
            noti_json = notification.select('notifications').json(
            function or({error, raw, previous})
            {
                console.error(`Could not parse "${raw}" as json.`, error)
                return previous  // This will be the new value of the store
            });
        }
    });
</script>

<Navbar />

<slot />
