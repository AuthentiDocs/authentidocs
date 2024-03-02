import type { RequestEvent } from "./$types";
import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add file signatures.");
  }
  // console.log(session);

  const file_signature_info = await request.json();
  //  console.log("inside file signature api: ",file_signature_info);

  let given_fileid = file_signature_info.fileid,
    given_signature = file_signature_info.signature,
    given_signing_key = file_signature_info.key,
    given_signing_userid = file_signature_info.userid;

  if (
    given_fileid === undefined ||
    given_fileid === null ||
    given_signature === undefined ||
    given_signature === null ||
    given_signing_key === undefined ||
    given_signing_key === null ||
    given_signing_userid === null ||
    given_signing_userid === undefined
  ) {
    console.log(
      "ERROR @api/files/addfilesignature:34: invalid user input error:\n",
      file_signature_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while adding file signature."
    );
  }

  let { data: result, error: _error } = await supabase.rpc(
    "add_personal_file_signature",
    {
      given_fileid,
      given_signature,
      given_signing_key,
      given_signing_userid,
    }
  );
  // console.log("error @33: ", _error)
  if (_error) {
    console.log(
      "ERROR @api/files/addfilesignature:55: supabase file signatuer insert error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding file signature."
    );
  }

  //  console.log("signing @42: "+result);

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
