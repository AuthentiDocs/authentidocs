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
      "You must be logged in to make notice seen."
    );
  }
  // console.log(session);
  const notice_info = await request.json();

  let given_noticeid = notice_info.noticeid;
  let given_userid = session.user.name;

  if (
    given_userid === undefined ||
    given_userid === null ||
    given_noticeid === undefined ||
    given_noticeid === null
  ) {
    console.log(
      "ERROR @api/notice/makenoticeseen:29: invalid user input error:\n",
      notice_info
    );
    return new (error as any)(422, "Invalid inputs, while making notice seen.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "make_user_notice_seen",
    {
      given_noticeid,
      given_userid,
    }
  );

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/notice/makenoticeseen:46: supabase making notice seen error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while making notice seen."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//notice/makenoticeseen
