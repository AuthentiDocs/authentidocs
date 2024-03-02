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
      "You must be logged in to add member to a thread."
    );
  }

  // console.log(session);
  const member_info = await request.json();
  // console.log("inside add key",key_info);
  let uid_list = member_info.uid_list;
  let given_threadid = member_info.threadid;

  if (
    uid_list === undefined ||
    uid_list === null ||
    given_threadid === undefined ||
    given_threadid === null
  ) {
    console.log(
      "ERROR @api/thread/addmember:30: invalid user input error:\n",
      member_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding member to thread."
    );
  }
  let { data: sign_serial, error: _error } = await supabase.rpc(
    "get_current_signing_serial",
    {
      given_threadid,
    }
  );

  if (_error) {
    console.log(
      "ERROR @api/thread/addmember:47: supabase get signing serial error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding member to thread."
    );
  }

  for (let i = 0; i < uid_list.length; i++) {
    let given_signing_serial = ++sign_serial;
    let given_user_role = "member";
    let given_userid = uid_list[i];
    let current_userid = session.user.name;

    let { data: result, error: _error } = await supabase.rpc(
      "add_thread_member",
      {
        current_userid,
        given_signing_serial,
        given_threadid,
        given_user_role,
        given_userid,
      }
    );

    // console.log("add key rps result",result)
    if (_error) {
      console.log(
        "ERROR @api/thread/addmember:76: supabase add thread member error\n",
        _error
      );
      return new (error as any)(
        500,
        "Internal Server Error, while adding member to thread."
      );
    }
  }

  let response: Response = new Response(JSON.stringify(sign_serial), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
