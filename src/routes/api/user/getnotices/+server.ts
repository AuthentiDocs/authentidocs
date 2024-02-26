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
      "You must be logged in to view user notices."
    );
  }
  // console.log(session);
  const user_info = await request.json();
  // console.log("inside add key",key_info);
  let given_userid = user_info.userid;

  if (given_userid === undefined || given_userid === null) {
    console.log(
      "ERROR @api/user/getnotices:23: invalid user input error:\n",
      user_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting user notices."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_user_all_notice",
    {
      given_userid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/user/getnotices:42: supabase get user notices error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting user notices."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//user/getnotices