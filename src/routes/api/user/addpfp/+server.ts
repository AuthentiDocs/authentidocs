import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { supabase } from "$lib/server/supabase_client.server";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(
      401,
      "You must be logged in to add user profile picture."
    );
  }
  // console.log(session);

  // const file_info = await request.json();
  const file_formData = await request.formData();
  
  // console.log(file_info);
  const file_data = file_formData.get("file") as File;

  if (file_data === undefined || file_data === null) {
    console.log("ERROR @api/user/addpfp:24: file form data undefined\n");
    return new (error as any)(
      422,
      "Invalid Input while adding user pfp"
    );
  }

  // const user_file = file_info.file;
  let fileExt = "";

  let temp_ext = await fileTypeFromBuffer(
    new Uint8Array(await file_data.arrayBuffer())
  );

  if (temp_ext === undefined) {
    fileExt = file_data.name?.split(".").pop() as string;
  } else {
    fileExt = temp_ext.ext;
  }

  // const blob = new Blob([new Uint8Array(user_file)], { type: file_mimetype });
  //
  let temp_name = uuidv4() + "." + fileExt;
  const filePath = "user_pfps/" + temp_name;

  const storage_call_response = await supabase.storage
    .from("user_pfps")
    .upload(filePath, file_data);

  if (storage_call_response.error) {
    console.error(
      "ERROR @api/user/addpfp:57: supabase storage upload error\n",
      storage_call_response.error
    );

    return new (error as any)(
      500,
      "Internal Server Error, while uploading file to cloud storage"
    );
  }

  const { data: _data } = supabase.storage
    .from("user_pfps")
    .getPublicUrl(filePath);

  let given_pfp_url = _data.publicUrl,
    given_userid = session.user.name;

  let { data: _result1, error: _error1 } = await supabase.rpc("edit_profile", {
    given_pfp_url,
    given_userid,
  });
  if (_error1) {
    console.log(
      "ERROR @api/user/addpfp:103: supabase edit pfp url error\n",
      _error1
    );
    return new (error as any)(
      500,
      "internal server error while editing pfp url"
    );
  }
  // console.log("add_file"+result1);

  let response: Response = new Response(JSON.stringify(_result1), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
