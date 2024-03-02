import type { RequestEvent } from "./$types";
import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(
      401,
      "You must be logged in to add file signatures"
    );
  }
  // console.log(session);

  const file_signature_info = await request.json();
  //  console.log("inside file signature api: ",file_signature_info);

  let given_fileid = file_signature_info.fileid,
    given_signature = file_signature_info.signature,
    given_signing_key = file_signature_info.key,
    given_current_userid = session.user.name;

  if (
    given_fileid === undefined ||
    given_fileid === null ||
    given_signature === undefined ||
    given_signature === null ||
    given_signing_key === undefined ||
    given_signing_key === null ||
    given_current_userid === null ||
    given_current_userid === undefined
  ) {
    console.log(
      "ERROR @api/thread/addthreadfilesignature:37: invalid user input error:\n",
      file_signature_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding file signature."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "make_threadfile_viewed_signed",
    {
      given_current_userid,
      given_fileid,
      given_signature,
      given_signing_key,
    }
  );
  // console.log("error @33: ", _error)
  if (_error) {
    console.log(
      "ERROR @api/thread/addthreadfilesignature:58: supabase file signature insert error\n",
      _error
    );
    return  new (error as any)(500, "Internal Server Error, while adding file signature in thread.");
  }

  //  console.log("signing @42: "+result);

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
