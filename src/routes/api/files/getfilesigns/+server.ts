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
      "You must be logged in to view files signatures."
    );
  }

  const file_info = await request.json();

  let given_fileid = file_info.fileid;
  // console.log("getfilesigns 19:", given_fileid);
  if (given_fileid === undefined || given_fileid === null) {
    console.log(
      "ERROR @api/files/getfilesigns:23: invalid user input error:\n",
      file_info
    );
    return new (error as any)(422, "Invalid inputs, while getting file signs.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_file_signatures_fileid",
    {
      given_fileid,
    }
  );
  // if (error) console.log("getfilesigns 24: ",error.toString());
  // console.log("getfilesigns 25: ", result);
  if (_error) {
    console.log(
      "ERROR @api/files/getfilesigns:39: supabase get file signatuers error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting file signature."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
