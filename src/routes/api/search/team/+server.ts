import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  // const session = await locals.getSession();
  // if (!session?.user) {
  //   return new (error as any)(401, "You must be logged in to get team details");
  // }
  const team_info = await request.json();
  //console.log(team_info);
  let term = team_info.term;
  //console.log(given_teamid)
  if (term === undefined || term === null) {
    console.log(
      "ERROR @api/search/team:19: invalid team input error:\n",
      team_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while getting team details."
    );
  }

  let { data:result, error:_error } = await supabase
  .rpc('search_teams', {
    term
  })

  if (_error) {
    console.log(
      "ERROR @api/team/details:36: supabase getting team data error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while getting team details."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
