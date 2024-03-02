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
      "You must be logged in to view thread members"
    );
  }

  // console.log(session);
  const thread_info = await request.json();
  let given_threadid = thread_info.given_threadid;
  let given_userid = session.user.name;

  if (
    given_threadid === undefined ||
    given_threadid === null ||
    given_userid === undefined ||
    given_userid === null
  ) {
    console.log(
      "ERROR @api/thread/getforwardablemembers:29: invalid user input error:\n",
      thread_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting thread forwardable members."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_thread_forwardable_members",
    {
      given_threadid,
      given_userid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/getforwardablemembers:49: supabase get forwardable thread members error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting forwardable member to thread."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
