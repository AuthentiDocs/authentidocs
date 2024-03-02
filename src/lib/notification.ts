import { get } from "svelte/store";
import { notifications } from "$lib/stores";

export class LiveNotification
{
    public id: string = "";
    public content: string = "";
    public seen: boolean = false;
    public level_id: string = "";
    public level:string = "";
}

export function get_notifications(user_id: string | null |undefined): void
{
    fetch("/api/user/getnotifications",
    {
        method: "POST",
        headers:
        {
            "content-type": "application/json"
        },
        body: JSON.stringify(
        {
            user_id: user_id
        })
    }).then(async (response: Response): Promise<void> =>
    {
        let response_obj: any = await response.json();

        notifications.set(new Array(response_obj.length));
        // console.log(response_obj);

        for(let i: number = 0; i < get(notifications).length; ++i)
        {
            get(notifications)[i] = new LiveNotification();
            get(notifications)[i].id = response_obj[i].f_notificationid;
            get(notifications)[i].content = response_obj[i].f_content;
            get(notifications)[i].seen = response_obj[i].f_is_seen;
            if(response_obj[i].f_threadid !=null)
            {
                get(notifications)[i].level = 'thread';
                get(notifications)[i].level_id = response_obj[i].f_threadid;
            }
            else if(response_obj[i].f_teamid !=null)
            {
                get(notifications)[i].level = 'team';
                get(notifications)[i].level_id = response_obj[i].f_teamid;
            }
            else if(response_obj[i].f_orgid !=null)
            {
                get(notifications)[i].level = 'org';
                get(notifications)[i].level_id = response_obj[i].f_orgid;
            }
            else
            {
                get(notifications)[i].level = '/home';
                get(notifications)[i].level_id = '';
            }
        }
    });
}