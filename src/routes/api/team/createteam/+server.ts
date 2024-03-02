import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to create team");
  }
  // console.log(session);
  const team_info = await request.json();
  // console.log("inside add key",key_info);
  let given_description = team_info.description;
  let given_userid = session.user.name;
  let given_teamname = team_info.teamname;
  let given_parent_orgid = team_info.parentorgid;

  if (
    given_description === undefined ||
    given_description === null ||
    given_teamname === undefined ||
    given_teamname === null ||
    given_parent_orgid === undefined ||
    given_parent_orgid === null ||
    given_userid === undefined ||
    given_userid === null
  ) {
    console.log(
      "ERROR @api/team/createteam:32: invalid user input error:\n",
      team_info
    );
    return new (error as any)(422, "Invalid inputs, while creating team.");
  }

  let { data: result, error: _error } = await supabase.rpc("create_team", {
    given_description,
    given_parent_orgid,
    given_teamname,
    given_userid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/team/createteam:48: supabase create team error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while creating team."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//team/createteam
