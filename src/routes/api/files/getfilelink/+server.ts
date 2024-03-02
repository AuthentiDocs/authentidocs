import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to view files.");
  }

  const file_info = await request.json();
  // console.log(key_info);
  let given_fileid = file_info.fileid;
  let given_userid = file_info.user_id;
  if (
    given_fileid === undefined ||
    given_fileid === null ||
    given_userid === undefined ||
    given_userid === null
  ) {
    console.log(
      "ERROR @api/files/getfilelink:25: invalid user input error:\n",
      file_info
    );
    return new (error as any)(422, "Invalid inputs, while getting file data.");
  }

  let { data: result1, error: _error1 } = await supabase.rpc(
    "get_single_filemetadata_fileid",
    {
      given_fileid,
      given_userid,
    }
  );

  if (_error1) {
    console.log(
      "ERROR @api/files/getfilelink:41: supabase getting file data error\n",
      _error1
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting file data."
    );
  }

  let result4, result5;
  if (result1.current_state === undefined || result1.current_state === null) {
    console.log(
      "ERROR @api/files/getfilelink:53: supabase returning incorrect result\n",
      result1
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting file data."
    );
  }

  if (result1.current_state == "personal") {
    const { data: result2, error: _error2 } = await supabase.storage
      .from("user_personal_files")
      .createSignedUrl(result1.file_url, 24 * 60 * 60);

    if (_error2) {
      console.log(
        "ERROR @api/files/getfilelink:69: supabase file link access error\n",
        _error2
      );
      return new (error as any)(
        500,
        "Internal Server Error, while getting file links."
      );
    }

    result4 = result2;
    const { data: result3, error: _error3 } = await supabase.storage
      .from("user_personal_files")
      .createSignedUrl(result1.file_url, 24 * 60 * 60, {
        download: result1.filename,
      });

    if (_error3) {
      console.log(
        "ERROR @api/files/getfilelink:87: supabase file link access error\n",
        _error3
      );
      return new (error as any)(
        500,
        "Internal Server Error, while getting file links."
      );
    }
    result5 = result3;
  } else {
    const { data: result2, error: _error2 } = await supabase.storage
      .from("files")
      .createSignedUrl(result1.file_url, 24 * 60 * 60);

    if (_error2) {
      console.log(
        "ERROR @api/files/getfilelink:103: supabase file link access error\n",
        _error2
      );

      return new (error as any)(
        500,
        "Internal Server Error, while getting file links."
      );
    }

    result4 = result2;

    const { data: result3, error: _error3 } = await supabase.storage
      .from("files")
      .createSignedUrl(result1.file_url, 24 * 60 * 60, {
        download: result1.filename,
      });

    if (_error3) {
      console.log(
        "ERROR @api/files/getfilelink:123: supabase file link access error\n",
        _error3
      );
      return new (error as any)(
        500,
        "Internal Server Error, while getting file link."
      );
    }
    result5 = result3;
  }
  if (
    result4.signedUrl === undefined ||
    result4.signedUrl === null ||
    result5.signedUrl === undefined ||
    result5.signedUrl === null
  ) {
    console.log(
      "ERROR @api/files/getfilelink:140: supabase file link access returns incorrect result\n",
      result4,
      "\n",
      result5
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting file link."
    );
  }

  let response: Response = new Response(
    JSON.stringify({
      file_link_preview: result4?.signedUrl,
      file_link_download: result5?.signedUrl,
      file_data: result1,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response;
}
