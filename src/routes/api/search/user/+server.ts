import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // const session = await locals.getSession();
  // if (!session?.user) {
  //   return new (error as any)(401, "You must be logged in to get user details");
  // }
  const user_info = await request.json();
  //console.log(user_info);
  let term = user_info.term;
  //console.log(given_userid)
  if (term === undefined || term === null) {
    console.log(
      "ERROR @api/search/user:19: invalid user input error:\n",
      user_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting user details."
    );
  }

  let { data:result, error:_error } = await supabase
  .rpc('search_user_by_name', {
    term
  })

  if (_error) {
    console.log(
      "ERROR @api/user/details:36: supabase getting user data error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting user details."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
