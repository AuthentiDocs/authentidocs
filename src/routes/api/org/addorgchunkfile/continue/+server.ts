import { filemap } from "$lib/server/stores";
import { error, json, type RequestEvent } from "@sveltejs/kit";
import { get } from "svelte/store";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add files.");
  }

  let url: URL = new URL(request.url);
  let filename: string | null = url.searchParams.get("filename");

  if (filename === null) {
    console.error(
      "ERROR @api/org/addorgchunkfile/continue:19: url parameter filename returned null"
    );
    get(filemap).clear();
    return json({ success: false });
  }

  let request_obj: any = await request.json();
  if (
    request_obj === null ||
    request_obj === undefined ||
    request_obj.data === null ||
    request_obj.data === undefined
  ) {
    console.error(
      "ERROR @api/org/addorgchunkfile/continue:33: request json null||undefined or has incorrect body"
    );
    get(filemap).clear();
    return json({ success: false });
  }
  let data: number[] = request_obj.data;
  let old_data: number[] | undefined = get(filemap).get(filename);

  if (old_data === undefined) {
    old_data = [];
  }

  old_data = old_data.concat(data);

  get(filemap).set(filename, old_data);

  return json({ sucess: true });
}
