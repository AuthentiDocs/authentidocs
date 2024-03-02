import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // const session = await locals.getSession();
  // if (!session?.user) {
  //   return new (error as any)(401, "You must be logged in to get notice details");
  // }
  const notice_info = await request.json();
  //console.log(notice_info);
  let given_noticeid = notice_info.noticeid;
  //console.log(given_noticeid)
  if (given_noticeid === undefined || given_noticeid === null) {
    console.log(
      "ERROR @api/notice/details:19: invalid notice input error:\n",
      notice_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting notice details."
    );
  }


  let { data:result, error:_error } = await supabase
  .rpc('get_noticedetails', {
    given_noticeid
  })

  if (_error) {
    console.log(
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
