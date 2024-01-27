import { filemap } from "$lib/server/stores";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";
import { supabase } from "$lib/server/supabase_client.server";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

export async function POST({
  request,
  cookies,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, "You must sign in to add files.");
  }
  let url: URL = new URL(request.url);
  let filename: string | null = url.searchParams.get("filename");

  if (filename === null) {
    return json({ success: false });
  }

  let file_array: number[] | undefined = get(filemap).get(filename);

  if (file_array === undefined) {
    return json({ success: false });
  }

  let file_uint8: Uint8Array = new Uint8Array(file_array);

  // console.log(file_array);

  let fileExt = "";
  let file_mimetype = "";
  let ret_mime;
  let temp_ext = await fileTypeFromBuffer(new Uint8Array(file_uint8));

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
  const filePath = "personal_files/" + temp_name;

  const { data } = await supabase.storage
    .from("user_personal_files")
    .upload(filePath, blob);
  // console.log("supabaseupload" + data);
  let given_file_extension = fileExt,
    given_file_ownerid = session?.user.name,
    given_file_url = filePath,
    given_filename = filename,
    given_file_mimetype = ret_mime;

  let { data: result1 } = await supabase.rpc("add_personal_file", {
    given_file_extension,
    given_file_mimetype,
    given_file_ownerid,
    given_file_url,
    given_filename,
  });

  // console.log("add_file" + result1);

  // flush
  //get(filemap).set(filename, []);
  get(filemap).clear()
  //fs.writeFileSync("/home/siam11651/" + filename, file_uint8);

  return json({ fileid: result1, sucess: true });
}