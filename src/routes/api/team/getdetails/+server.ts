import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // const session = await locals.getSession();
  // if (!session?.user) {
  //   return new (error as any)(401, "You must be logged in to get team details");
  // }
  // console.log(session);
  const team_info = await request.json();
  // console.log("inside add key",key_info);
  let given_teamid = team_info.teamid;
  if (given_teamid === undefined || given_teamid === null) {
    console.log(
      "ERROR @api/team/getdetails:19: invalid user input error:\n",
      team_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting team details."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("get_team_details", {
    given_teamid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/team/getdetails:35: supabase getting team details error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting team details."
    );
  }
  //   let result_2 :
  let { data: result_2, error: error_2 } = await supabase.rpc(
    "get_team_mods_details",
    {
      given_teamid,
    }
  );
  if (error_2) {
    console.log(
      "ERROR @api/team/getdetails:52: supabase getting team mod details error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting team details."
    );
  }

  if (result_2 === undefined || result_2 === null) {
    console.log(
      "ERROR @api/team/getdetails:63: invalid user input error:\n",
      result_2
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting team details."
    );
  }
  let result_mod = result_2[0];
  let result_3 = {
    team_detail: result,
    team_mod_detail: result_mod,
  };

  let response: Response = new Response(JSON.stringify(result_3), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
