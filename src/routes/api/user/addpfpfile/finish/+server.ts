import { filemap } from "$lib/server/stores";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { supabase } from "$lib/server/supabase_client.server";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add pfp.");
  }
  let url: URL = new URL(request.url);
  let filename: string | null = url.searchParams.get("filename");
  let given_userid = session.user.name;

  if (filename === null) {
    console.error(
      "ERROR @api/user/addpfpfile/finish:21: url param filename returned as undefined"
    );
    get(filemap).clear();
    return json({ success: false });
  }

  let file_array: number[] | undefined = get(filemap).get(filename);

  if (file_array === undefined) {
    console.error(
      "ERROR @api/user/addpfpfile/finish:31: array filearray returned as undefined from filemap"
    );
    get(filemap).clear();
    return json({ success: false });
  }

  let file_uint8: Uint8Array = new Uint8Array(file_array);

  // console.error(file_array);

  let fileExt = "";
  let file_mimetype = "";
  let temp_ext = await fileTypeFromBuffer(file_uint8);

  if (temp_ext === undefined) {
    fileExt = filename.split(".").pop() as string;
  } else {
    fileExt = temp_ext.ext;
  }

  const blob = new Blob([file_uint8], { type: file_mimetype });
  //
  let temp_name = uuidv4() + "." + fileExt;
  const filePath = "user_pfps/" + temp_name;

  const storage_call_response = await supabase.storage
    .from("user_pfps")
    .upload(filePath, blob);

  if (storage_call_response.error) {
    console.error(
      "ERROR @api/user/addpfpfile/addchunkfile/finish:73: supabase storage upload error\n",
      storage_call_response.error
    );
    get(filemap).clear();
    return new (error as any)(
      500,
      "Internal Server Error, while uploading file to cloud storage"
    );
  }

  const { data: _data } = supabase.storage
    .from("user_pfps")
    .getPublicUrl(filePath);

  let given_pfp_url = _data.publicUrl;
  //   console.log(given_pfp_url);
  if (given_pfp_url === undefined || given_pfp_url === null) {
    console.error(
      "ERROR @api/user/addpfpfile/finish:81: supabase editing user profile error\n",
      _data
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding prfile picture link."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("edit_profile", {
    given_userid,
    given_pfp_url,
  });
  if (_error) {
    get(filemap).clear();
    console.error(
      "ERROR @api/user/addpfpfile/finish:97: supabase editing user profile error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding prfile picture link."
    );
  }

  get(filemap).clear();

  return json({ updated_count: result, success: true });
}
