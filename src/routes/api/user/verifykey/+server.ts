import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // console.log(session);
  const key_info = await request.json();
  let given_pubkey = key_info.key;

  if (given_pubkey === undefined || given_pubkey === null) {
    console.error(
      "ERROR @api/user/verifykey:15: invalid user input error:\n",
      key_info
    );
    return new (error as any)(422, "Invalid inputs, while searching a key.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_user_detail_pubkey",
    {
      given_pubkey,
    }
  );

  if (_error) {
    console.error(
      "ERROR @api/user/verifykey:30: supabase searching user publickey error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while searching user key"
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
