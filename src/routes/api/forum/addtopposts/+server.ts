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
      "You must be logged in to add top level post"
    );
  }

  const post_info = await request.json();

  let given_content = post_info.content;
  let given_creator_id = session.user.name;
  let given_title = "";
  let given_forumid = post_info.thread_name;

  if (
    given_content === undefined ||
    given_content === null ||
    given_creator_id === undefined ||
    given_creator_id === null ||
    given_title === undefined ||
    given_title === null ||
    given_forumid === undefined ||
    given_forumid === null
  ) {
    console.error(
      "ERROR @api/forum/addtopposts:35: invalid user input error:\n",
      post_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding top level post."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("add_top_post", {
    given_content,
    given_creator_id,
    given_forumid,
    given_title,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.error(
      "ERROR @api/forum/addtopposts:54: supabase making top level post error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while making top level post."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//forum/addtopposts
