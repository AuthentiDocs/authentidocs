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
      "You must be logged in to view thread notices."
    );
  }
  // console.log(session);
  const thread_info = await request.json();
  // console.log("inside add key",key_info);
  let given_threadid = thread_info.threadid;

  if (given_threadid === undefined || given_threadid === null) {
    console.log(
      "ERROR @api/thread/getunseennotices:23: invalid user input error:\n",
      thread_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting thread notices."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_thread_unseen_notice",
    {
      given_threadid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/getunseennotices:42: supabase get thread notices error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting thread notices."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//thread/getunseennotices
