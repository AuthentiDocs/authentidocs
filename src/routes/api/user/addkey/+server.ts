import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add public key");
  }
  // console.log(session);
  const key_info = await request.json();
  // console.log("inside add key",key_info);
  let given_publickey = key_info.key;
  let given_userid = key_info.user_id;

  if (
    given_publickey === undefined ||
    given_publickey === null ||
    given_userid === undefined ||
    given_userid === null
  ) {
    console.log(
      "ERROR @api/user/addkey:26: invalid user input error:\n",
      key_info
    );
    return new (error as any)(422, "Invalid inputs, while adding user key.");
  }
  let { data: result, error: _error } = await supabase.rpc(
    "add_publickey_user",
    {
      given_publickey,
      given_userid,
    }
  );
  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/user/addkey:41: supabase add user publickey error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding user key."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
