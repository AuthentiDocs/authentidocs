import type { RequestEvent } from "./$types";
import { supabase } from "$lib/server/supabase_client.server";
import { error } from "console";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to get files.");
  }
  // console.log(session)

  const user_info = await request.json();
  let given_userid = user_info.given_userid;
  let given_file_extension = user_info.given_file_extension;

  if (
    given_userid === undefined ||
    given_userid === null ||
    given_file_extension === undefined ||
    given_file_extension === null
  ) {
    console.log(
      "ERROR @api/files/getpersonalfiles_extension:26: invalid user input error:\n",
      user_info
    );
    return new (error as any)(422, "Invalid inputs, while getting files.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_user_personal_files_by_type_userid_mohaimin",
    {
      given_file_extension,
      given_userid,
    }
  );
  if (_error) {
    console.log(
      "ERROR @api/files/getpersonalfiles_extension:41: supabase personal file access error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting files."
    );
  }

  // console.log(data)

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
