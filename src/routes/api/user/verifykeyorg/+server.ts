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
  let given_orgid = key_info.orgid;

  if (
    given_pubkey === undefined ||
    given_pubkey === null ||
    given_orgid === undefined ||
    given_orgid === null
  ) {
    console.log(
      "ERROR @api/user/verifykeyorg:29: invalid user input error:\n",
      key_info
    );
    return new (error as any)(422, "Invalid inputs, while searching a key.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_user_org_detail_pubkey",
    {
      given_orgid,
      given_pubkey,
    }
  );
  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/user/verifykeyorg:45: supabase searching user publickey organization level error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while searching user key at organizational level."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
