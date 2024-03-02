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
    return new (error as any)(401, "You must be logged in to add file");
  }
  let url: URL = new URL(request.url);
  let filename: string | null = url.searchParams.get("filename");
  let given_orgid: string | null = url.searchParams.get("orgid");

  if (
    filename === null ||
    filename === undefined ||
    given_orgid === undefined ||
    filename === undefined
  ) {
    console.log(
      "ERROR @api/org/addorgchunkfile/finish:22: filename or given_orgid returned empty/undefined from url"
    );
    get(filemap).clear();
    return json({ success: false });
  }

  let file_array: number[] | undefined = get(filemap).get(filename);

  if (file_array === undefined) {
    console.log(
      "ERROR @api/org/addorgchunkfile/finish:32: array filearray returned as undefined from filemap"
    );
    get(filemap).clear();
    return json({ success: false });
  }

  let file_uint8: Uint8Array = new Uint8Array(file_array);

  // console.log(file_array);

  let fileExt = "";
  let file_mimetype = "";
  let ret_mime;
  let temp_ext = await fileTypeFromBuffer(file_uint8);

  if (temp_ext === undefined) {
    fileExt = filename.split(".").pop() as string;
    ret_mime = 3;
  } else {
    fileExt = temp_ext.ext;
    file_mimetype = temp_ext.mime;
    let file_mime = file_mimetype.split("/").reverse().pop();
    if (file_mime === "image") {
      ret_mime = 1;
    } else if (file_mimetype === "application/pdf") {
      ret_mime = 2;
    } else {
      ret_mime = 3;
    }
  }

  const blob = new Blob([file_uint8], { type: file_mimetype });
  //
  let temp_name = uuidv4() + "." + fileExt;
  const filePath = "org_files/" + temp_name;

  const storage_call_response = await supabase.storage
    .from("files")
    .upload(filePath, blob);
  // console.log("supabaseupload" + data);
  if (storage_call_response.error) {
    console.log(
      "ERROR @api/org/addorgchunkfile/finish:79: supabase storage upload error\n",
      storage_call_response.error
    );
    get(filemap).clear();
    return new (error as any)(
      500,
      "Internal Server Error, while adding file to org."
    );
  }
  let given_file_extension = fileExt,
    given_file_ownerid = session?.user.name,
    given_file_url = filePath,
    given_filename = filename,
    given_file_mimetype = ret_mime;

  let { data: result, error: _error } = await supabase.rpc("add_org_file", {
    given_file_extension,
    given_file_mimetype,
    given_file_ownerid,
    given_file_url,
    given_filename,
    given_orgid,
  });

  if (_error) {
    get(filemap).clear();
    console.log(
      "ERROR @api/org/addorgchunkfile/finish:106: supabase file data insert into database error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while adding file to org."
    );
  }

  //console.log("add_file" + result);

  // flush
  //get(filemap).set(filename, []);
  get(filemap).clear();
  //fs.writeFileSync("/home/siam11651/" + filename, file_uint8);

  return json({ fileid: result, sucess: true });
}
