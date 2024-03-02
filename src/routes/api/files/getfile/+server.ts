import { supabase } from "$lib/server/supabase_client.server";
import type { RequestEvent } from "./$types";
import { json, error } from "@sveltejs/kit";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new Response(JSON.stringify("you must be logged in to add files"), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 401,
    });
  }
  const file_info = await request.json();
  // console.log(key_info);
  let ret_text;
  let given_fileid = file_info.fileid;
  let given_userid = file_info.user_id;

  let { data: result } = await supabase.rpc(
    "get_user_personal_file_single_userid",
    {
      given_fileid,
      given_userid,
    }
  );
  // if (error) console.error(error)
  // else console.log(result)

  // console.log(result)

  const { data: result1 } = await supabase.storage
    .from("user_personal_files")
    .download(result.file_url);

  let file_buffer: ArrayBuffer | undefined = await result1?.arrayBuffer();

  ret_text = Array.from(new Uint8Array(file_buffer as ArrayBuffer));

  let { data: result2, error: _error } = await supabase.rpc(
    "get_single_filedata_fileid",
    {
      given_fileid,
      given_userid,
    }
  );
  // if (_error) console.error(_error)
  // else console.log(result2)

  let response_obj = { file_blob: ret_text, file_data: result2 };
  let response: Response = new Response(JSON.stringify(response_obj), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
