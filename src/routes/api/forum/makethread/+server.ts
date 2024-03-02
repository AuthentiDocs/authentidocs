import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add forum thread");
  }

  // console.log(session);
  const forum_info = await request.json();
  // console.log("inside add key",key_info);
  let given_hierarchy_level = forum_info.hierarchy_level;
  let given_hierarchy_level_id = forum_info.hierarchy_level_id;
  let given_creator_id = session.user.name;
  let given_forum_subject = forum_info.subject;
  let given_forum_thread_name = forum_info.thread_name;

  if (
    given_hierarchy_level === undefined ||
    given_hierarchy_level === null ||
    given_hierarchy_level_id === undefined ||
    given_hierarchy_level_id === null ||
    given_creator_id === undefined ||
    given_creator_id === null ||
    given_forum_subject === undefined ||
    given_forum_subject === null ||
    given_forum_thread_name === undefined ||
    given_forum_thread_name === null
  ) {
    console.error(
      "ERROR @api/forum/makethread:36: invalid user input error:\n",
      forum_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting forum addable members."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("add_forum_thread", {
    given_creator_id,
    given_forum_subject,
    given_forum_thread_name,
    given_hierarchy_level,
    given_hierarchy_level_id,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.error(
      "ERROR @api/forum/makethread:57: supabase making forum thread error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while making forum."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//forum/makethread
