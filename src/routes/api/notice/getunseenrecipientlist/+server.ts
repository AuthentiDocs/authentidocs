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
      "You must be logged in to view notice unseen recipient list."
    );
  }
  // console.log(session);
  const notice_info = await request.json();

  let given_noticeid = notice_info.noticeid;

  if (given_noticeid === undefined || given_noticeid === null) {
    console.log(
      "ERROR @api/notice/getunseenrecipientlist:23: invalid user input error:\n",
      notice_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting notice unseen recipient list."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_notice_unseen_recipient_list",
    {
      given_noticeid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/notice/getunseenrecipientlist:42: supabase get notice unseen recipient list error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting notice unseen recipient list."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//notice/getunseenrecipientlist
