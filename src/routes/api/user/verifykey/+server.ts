import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // console.log(session);
  const key_info = await request.json();
  // console.log("inside add key",key_info);
  let given_pubkey = key_info.key;

  if (given_pubkey === undefined || given_pubkey === null) {
    console.log(
      "ERROR @api/user/verifykey:23: invalid user input error:\n",
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
  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/user/verifykey:38: supabase searching user publickey organization level error\n",
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

  const { data: _data } = supabase.storage
    .from("user_pfps")
    .getPublicUrl("user_pfps/Output_11.bmp");
  let given_pfp_url = _data;
  console.log(given_pfp_url);

  return response;
}
