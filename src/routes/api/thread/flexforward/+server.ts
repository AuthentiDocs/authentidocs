import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add file");
  }
  // console.log(session);
  const thread_info = await request.json();
  // console.log("inside add key",key_info);

  let given_src_userid = session.user.name;
  let given_target_userid = thread_info.targetid;
  let given_threadid = thread_info.threadid;

  if (
    given_src_userid === undefined ||
    given_src_userid === null ||
    given_threadid === undefined ||
    given_threadid === null
  ) {
    console.log(
      "ERROR @api/thread/forward:28: invalid user input error:\n",
      thread_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding file signature."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("forward_thread", {
    given_src_userid,
    given_target_userid,
    given_threadid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/forward:75: supabase forward thread error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while forwarding thread."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
