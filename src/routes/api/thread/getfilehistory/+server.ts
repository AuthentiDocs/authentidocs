import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to get file history");
  }
  // console.log(session);
  const file_info = await request.json();

  let given_fileid = file_info.fileid;

  if (given_fileid === undefined || given_fileid === null) {
    console.error(
      "ERROR @api/thread/getfilehistory:21: invalid user input error:\n",
      file_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting file history."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_file_history_fileid",
    {
      given_fileid,
    }
  );

  if (_error) {
    console.error(
      "ERROR @api/thread/getfilehistory:38: supabase get file history error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting thread file history."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
