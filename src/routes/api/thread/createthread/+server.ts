import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to create thread");
  }
  // console.log(session);
  const thread_info = await request.json();
  // console.log("inside add key",key_info);
  let given_description = thread_info.description;
  let given_parent_teamid = thread_info.given_parent_teamid;
  let given_threadname = thread_info.given_threadname;
  // let uid_list = thread_info.uid_list;
  // let sign_serial=0;
  let given_userid = session.user.name;

  if (
    given_description === undefined ||
    given_description === null ||
    given_parent_teamid === undefined ||
    given_parent_teamid === null ||
    given_threadname === undefined ||
    given_threadname === null
  ) {
    console.log(
      "ERROR @api/thread/createthread:32: invalid user input error:\n",
      thread_info
    );
    return new (error as any)(422, "Invalid inputs, while creating thread.");
  }

  let { data: result, error: _error } = await supabase.rpc("create_thread", {
    given_description,
    given_parent_teamid,
    given_threadname,
    given_userid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/createthread:48: supabase create thread error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while creating thread."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
