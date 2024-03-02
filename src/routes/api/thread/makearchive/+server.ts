import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to archive thread");
  }
  // console.log(session);
  const thread_info = await request.json();
  // console.log("inside add key",key_info);

  let given_closing_comment = thread_info.closing_comment;
  let given_threadid = thread_info.threadid;
  let given_current_userid = session.user.name;
  if (
    given_threadid === undefined ||
    given_threadid === null ||
    given_closing_comment === undefined ||
    given_closing_comment === null ||
    given_current_userid === undefined ||
    given_current_userid === null
  ) {
    console.log(
      "ERROR @api/thread/makearchive:29: invalid user input error:\n",
      thread_info
    );
    return new (error as any)(422, "Invalid inputs, while archiving thread.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "make_thread_archived",
    {
      given_closing_comment,
      given_current_userid,
      given_threadid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/makearchive:47: supabase make thread archived error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while archiving thread."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
