import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to view org teams.");
  }
  // console.log(session);
  const org_info = await request.json();
  let given_orgid = org_info.orgid;

  if (given_orgid === undefined || given_orgid === null) {
    console.error(
      "ERROR @api/org/getteams:20: invalid user input error:\n",
      org_info
    );
    return new (error as any)(422, "Invalid inputs, while getting org teams.");
  }

  let { data: result, error: _error } = await supabase.rpc(
    "get_org_team_list",
    {
      given_orgid,
    }
  );

  if (_error) {
    console.error(
      "ERROR @api/org/getteams:34: supabase get org teams error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting org teams."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//org/getteams
