import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // const session = await locals.getSession();
  // if (!session?.user) {
  //   return new (error as any)(401, "You must be logged in to get org details");
  // }
  // console.log(session);
  const org_info = await request.json();
  // console.log("inside add key",key_info);
  let given_orgid = org_info.orgid;
  if (given_orgid === undefined || given_orgid === null) {
    console.log(
      "ERROR @api/org/getdetails:19: invalid user input error:\n",
      org_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting org details."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("get_org_details", {
    given_orgid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/org/getdetails:35: supabase getting org details error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting org details."
    );
  }
  //   let result_2 :
  let { data: result_2, error: error_2 } = await supabase.rpc(
    "get_org_mods_details",
    {
      given_orgid,
    }
  );
  if (error_2) {
    console.log(
      "ERROR @api/org/getdetails:52: supabase getting org mod details error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting org details."
    );
  }

  let result_mod = result_2[0];

  if (result_mod === undefined || result_mod === null) {
    console.log(
      "ERROR @api/org/getdetails:65: supabase getting org mod details error\n",
      result_mod
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting org details."
    );
  }

  let result_3 = {
    org_detail: result,
    org_mod_detail: result_mod,
  };

  let response: Response = new Response(JSON.stringify(result_3), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//org/getdetails