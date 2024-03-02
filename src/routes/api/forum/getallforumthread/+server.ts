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
  let given_uid: string = forum_info.hierarchy_level_id;

  if (given_uid === undefined || given_uid === null) {
    console.error(
      "ERROR @api/forum/getallforumthread:21: invalid user input error:\n",
      forum_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting all threads of a hierarchy."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_hierarchy_all_forum_metadata",
    {
      given_uid
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.error(
      "ERROR @api/forum/getallforumthread:40: supabase getting all forum thread of hierarchy error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting all forum thread of a hierarchy."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//forum/getallforumthread
