import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to get user keys");
  }
  const key_info = await request.json();

  let given_userid = key_info.user_id;
  if (given_userid === undefined || given_userid === null) {
    console.log(
      "ERROR @api/user/getkey:18: invalid user input error:\n",
      key_info
    );
    return new (error as any)(422, "Invalid inputs, while getting user keys.");
  }
  let { data: result, error: _error } = await supabase.rpc(
    "get_user_publickey_userid",
    {
      given_userid,
    }
  );
  if (_error) {
    console.log(
      "ERROR @api/user/getkey:31: supabase getting user key error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting user key."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
