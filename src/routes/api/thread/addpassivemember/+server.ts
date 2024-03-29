import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(
      401,
      "You must be logged in to add passive member to a thread."
    );
  }

  // console.log(session);
  const member_info = await request.json();
  let uid_list = member_info.uid_list;
  let given_threadid = member_info.threadid;

  if (
    uid_list === undefined ||
    uid_list === null ||
    given_threadid === undefined ||
    given_threadid === null
  ) {
    console.error(
      "ERROR @api/thread/addpassivemember:30: invalid user input error:\n",
      member_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding member to thread."
    );
  }

  for (let i = 0; i < uid_list.length; i++) {
    let given_userid = uid_list[i];
    let current_userid = session.user.name;

    let { data: result, error: _error } = await supabase.rpc(
      "add_thread_passive_member",
      {
        current_userid,
        given_threadid,
        given_userid,
      }
    );

    if (_error) {
      console.log(
        "ERROR @api/thread/addpassivemember:76: supabase add passive thread member error\n",
        _error
      );
      return new (error as any)(
        500,
        "Internal Server Error, while adding passive member to thread."
      );
    }
  }

  let response: Response = new Response(JSON.stringify(1), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
