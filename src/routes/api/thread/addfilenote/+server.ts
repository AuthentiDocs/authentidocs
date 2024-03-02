import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add file notes.");
  }
  // console.log(session);
  const file_info = await request.json();
  // console.log("inside add key",key_info);

  let given_content = file_info.content;
  let given_fileid = file_info.fileid;
  let given_signature = file_info.sign;
  let given_signing_key = file_info.signing_key;
  let given_signing_userid = file_info.given_signing_userid;

  if (
    given_fileid === undefined ||
    given_fileid === null ||
    given_content === undefined ||
    given_content === null ||
    given_signature === undefined ||
    given_signature === null ||
    given_signing_key === undefined ||
    given_signing_key === null ||
    given_signing_userid === undefined ||
    given_signing_userid === null
  ) {
    console.log(
      "ERROR @api/thread/addfilenote:36: invalid user input error:\n",
      file_info
    );
    return new (error as any)(422, "Invalid inputs, while adding file notes.");
  }

  let { data: result, error: _error } = await supabase.rpc("add_file_note", {
    given_content,
    given_fileid,
    given_signature,
    given_signing_key,
    given_signing_userid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/thread/addfilenote:53: supabase add file note error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding file notes."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
