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
      "You must be logged in to edit user profiles."
    );
  }
  // console.error(session);
  const user_info = await request.json();

  let src_userid = session.user.name;
  let given_userid = user_info.userid;
  let given_username = user_info.username;
  let given_email = user_info.email;
  let given_pwd_hash = user_info.pwd_hash;
  let given_pfp_url = user_info.pfp_url;

  if (given_userid === undefined || given_userid === null) {
    console.error(
      "ERROR @api/user/editprofile:28: invalid user input error:\n",
      user_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while editing user profile."
    );
  }

  if (given_email === undefined) {
    given_email = null;
  }
  if (given_pfp_url === undefined) {
    given_pfp_url = null;
  }
  if (given_pwd_hash === undefined) {
    given_pwd_hash = null;
  }
  if (given_username === undefined) {
    given_username = null;
  }
  if (given_userid !== src_userid) {
    console.error(
      "ERROR @api/user/editprofile:28: forbidden access:\n",
      user_info
    );
    return new (error as any)(
      403,
      "Forbidden access, while editing user profile."
    );
  }

  
//   console.log("api/user/editprofile/: \n", given_email, given_pfp_url, given_pwd_hash, given_userid, given_username);

  let { data: result, error: _error } = await supabase.rpc("edit_profile", {
    given_email,
    given_pfp_url,
    given_pwd_hash,
    given_userid,
    given_username,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/user/profile:42: supabase edit user profile error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while editing user profile."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
//user/profile
