import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(
      401,
      "You must be logged in to poll notifications"
    );
  }

  // console.log(session);
  const user_info = await request.json();
  let given_userid = user_info.given_userid;
  if (given_userid === undefined || given_userid === null) {
    console.error(
      "ERROR @api/user/pollnotificaitons:23: invalid user input error:\n",
      user_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while polling user notification."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "are_there_notifications",
    {
      given_userid,
    }
  );

  if (_error) {
    console.error(
      "ERROR @api/user/pollnotifications:40: supabase polling notification existence error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while polling user notification."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
