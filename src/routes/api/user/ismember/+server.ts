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
  const user_info = await request.json();
  // console.log("inside add key",key_info);
  let given_hierarchy_name=user_info.level;
  let given_hierarchy_id=user_info.level_id;
  let given_userid=user_info.id


 


  let { data:result, error:_error } = await supabase
  .rpc('is_member_of', {
    given_hierarchy_id, 
    given_hierarchy_name, 
    given_userid
  })

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/team/forward:75: supabase forward team error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while forwarding team."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
