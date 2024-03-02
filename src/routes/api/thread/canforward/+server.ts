import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to forward thread");
  }
  // console.log(session);
  const thread_info = await request.json();
  // console.log("inside add key",key_info);
  let given_threadid = thread_info.given_threadid;
  let given_userid = session.user.name;

  if (given_threadid === undefined || given_threadid === null) {
    console.log(
      "ERROR @api/thread/canforward:20: invalid user input error:\n",
      thread_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while checking forwarding status of thread."
    );
  }

  let { data:result, error:_error } = await supabase
  .rpc('can_forward_thread2', {
    given_threadid, 
    given_userid
  })

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/canforward:39: supabase check thread forward error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while checking thread forward error."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
