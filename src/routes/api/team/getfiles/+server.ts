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
      "You must be logged in to view team files."
    );
  }

  // console.log(session);
  const team_info = await request.json();
  // console.log("inside add key",key_info);
  let given_teamid = team_info.teamid;

  if (given_teamid === undefined || given_teamid === null) {
    console.log(
      "ERROR @api/team/getfiles:24: invalid user input error:\n",
      team_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting team files."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_team_file_list",
    {
      given_teamid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/team/getfiles:43: supabase get team files error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting team files."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
