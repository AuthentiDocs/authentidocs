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
      "You must be logged in to add member to a team."
    );
  }

  // console.log(session);
  const member_info = await request.json();
  // console.log("inside add key",key_info);
  let uid_list = member_info.uid_list;
  let given_teamid = member_info.teamid;

  if (
    uid_list === undefined ||
    uid_list === null ||
    given_teamid === undefined ||
    given_teamid === null
  ) {
    console.log(
      "ERROR @api/team/addmember:30: invalid user input error:\n",
      member_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding member to team."
    );
  }

  for (let i = 0; i < uid_list.length; i++) {
    let given_user_role = "member";
    let given_userid = uid_list[i];
    let current_userid = session.user.name;
    let given_user_post = "officer";

    let { data: result, error: _error } = await supabase.rpc("add_team_member", {
      current_userid,
      given_teamid,
      given_user_post,
      given_user_role,
      given_userid,
    });

    if (_error) {
      console.log(
        "ERROR @api/team/addmember:55: supabase add team member error\n",
        _error
      );
      return new (error as any)(
        500,
        "Internal Server Error, while adding member to team."
      );
    }
  }

  let response: Response = new Response(JSON.stringify(uid_list.length), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
