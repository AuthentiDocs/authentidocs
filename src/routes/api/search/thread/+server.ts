import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // const session = await locals.getSession();
  // if (!session?.user) {
  //   return new (error as any)(401, "You must be logged in to get thread details");
  // }
  const thread_info = await request.json();
  //console.log(thread_info);
  let term = thread_info.term;
  //console.log(given_threadid)
  if (term === undefined || term === null) {
    console.log(
      "ERROR @api/search/thread:19: invalid thread input error:\n",
      thread_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting thread details."
    );
  }

  let { data:result, error:_error } = await supabase
  .rpc('search_threads', {
    term
  })

  if (_error) {
    console.log(
      "ERROR @api/thread/details:36: supabase getting thread data error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting thread details."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
