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
      "You must be logged in to get forum top level post data"
    );
  }

  // console.log(session);
  const forum_info = await request.json();
  let given_forumid = forum_info.forum_id;

  if (given_forumid === undefined || given_forumid === null) {
    console.error(
      "ERROR @api/forum/getforumtoplevelpost:24: invalid user input error:\n",
      forum_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting top level post data."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_forum_top_level_posts",
    {
      given_forumid,
    }
  );

  
  if (_error) {
    console.error(
      "ERROR @api/forum/getforumtoplevelpost:43: supabase getting top level post data error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting top level post data."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//forum/getforumtoplevelpost
