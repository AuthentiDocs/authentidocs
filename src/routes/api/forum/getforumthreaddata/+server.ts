import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to get forum metadata");
  }

  // console.log(session);
  const forum_info = await request.json();
  let given_forumid = forum_info.forum_id;

  if (given_forumid === undefined || given_forumid === null) {
    console.error(
      "ERROR @api/forum/getforumthreaddata:21: invalid user input error:\n",
      forum_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting discussion forum metadata."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_forum_metadata",
    {
      given_forumid,
    }
  );

  
  if (_error) {
    console.error(
      "ERROR @api/forum/getforumthreaddata:40: supabase getting forum metadata error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting thread metadata."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//forum/getforumthreaddata
