import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(
      401,
      "You must be logged in to get notifications"
    );
  }
  const user_info = await request.json();

  let given_userid = user_info.user_id;
  let notifications_list: any[] = [];
  if (given_userid === undefined || given_userid === null) {
    console.log(
      "ERROR @api/user/getnotifications:22: invalid user input error:\n",
      user_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting user notifications."
    );
  }
  let { data: result, error: _error } = await supabase.rpc(
    "get_user_live_notifications",
    {
      given_userid,
    }
  );

  if (_error) {
    console.log(
      "ERROR @api/user/getnotifications:40: supabase getting user notification error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting user notifications."
    );
  }
  notifications_list = result;
  let response: Response = new Response(JSON.stringify(notifications_list), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
