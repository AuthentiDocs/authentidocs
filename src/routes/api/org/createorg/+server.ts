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
      "You must be logged in to create organization"
    );
  }
  // console.log(session);
  const org_info = await request.json();
  // console.log("inside add key",key_info);
  let given_description = org_info.description;
  let given_userid = session.user.name;
  let given_orgname = org_info.orgname;

  if (
    given_description === undefined ||
    given_description === null ||
    given_orgname === undefined ||
    given_orgname === null ||
    given_userid ===null ||
    given_userid === undefined
  ) {
    console.log(
      "ERROR @api/org/createorg:32: invalid user input error:\n",
      org_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while creating organization."
    );
  }

  let { data: result, error: _error } = await supabase.rpc("create_org", {
    given_description,
    given_orgname,
    given_userid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/org/createorg:50: supabase create organization error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while creating organization."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
// org/createorg