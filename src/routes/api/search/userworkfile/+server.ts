import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to get notice details");
  }
  const file_info = await request.json();
  //console.log(notice_info);
  let term = file_info.term;
  let given_userid = file_info.userid;
  //console.log(given_noticeid)
  if (term === undefined || term === null) {
    console.error(
      "ERROR @api/search/userfile:19: invalid fileinfo input error:\n",
      file_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting notice details."
    );
  }

  let { data:result, error:_error } = await supabase
  .rpc('search_user_work_file', {
    given_userid, 
    term
  })
  if (_error) {
    console.error(
      "ERROR @api/notice/details:36: supabase getting notice data error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting notice details."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
