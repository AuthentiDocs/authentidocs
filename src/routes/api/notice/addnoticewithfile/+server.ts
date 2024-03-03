import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add notice .");
  }
  // console.log(session);
  const notice_info = await request.json();

  let given_creator_id = session.user.name;
  let given_hierarchy_level = notice_info.hierarchy_level;
  let given_hierarchy_level_id = notice_info.hierarchy_level_id;
  let given_content = notice_info.content;
  let given_subject = notice_info.subject;
  let given_fileid = notice_info.fileid;

  if (
    given_fileid === undefined ||
    given_fileid === null ||
    given_hierarchy_level === undefined ||
    given_hierarchy_level === null ||
    given_hierarchy_level_id === undefined ||
    given_hierarchy_level_id === null ||
    given_content === undefined ||
    given_content === null ||
    given_subject === undefined ||
    given_subject === null ||
    given_creator_id === undefined ||
    given_creator_id === null
  ) {
    console.error(
      "ERROR @api/notice/addnoticewithfile:38: invalid user input error:\n",
      notice_info
    );
    return new (error as any)(422, "Invalid inputs, while adding notice .");
  }

  let { data: result, error: _error } = await supabase.rpc("add_notice", {
    given_content,
    given_creator_id,
    given_fileid,
    given_hierarchy_level,
    given_hierarchy_level_id,
    given_subject,
  });

  
  if (_error) {
    console.error(
      "ERROR @api/notice/addnoticewithfile:56: supabase adding notice error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding notice ."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//notice/addnoticewithfile
