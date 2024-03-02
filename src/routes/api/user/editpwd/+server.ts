import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST({
  request,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to edit user pwd.");
  }
  // console.error(session);
  const user_info = await request.json();

  let src_userid = session.user.name;
  let given_userid = user_info.userid;
  let given_new_pwd_hash = user_info.new_pwd_hash;

  let given_old_pwd_hash = user_info.old_pwd_hash;

  if (
    given_userid === undefined ||
    given_userid === null ||
    given_new_pwd_hash === undefined ||
    given_new_pwd_hash === null ||
    given_old_pwd_hash === undefined ||
    given_old_pwd_hash === null
  ) {
    console.error(
      "ERROR @api/user/editpwd:31: invalid user input error:\n",
      user_info
    );
    return new (error as any)(
      422,
      "Invalid inputs, while editing user password."
    );
  }

  if (given_userid !== src_userid) {
    console.error("ERROR @api/user/editpwd:28: forbidden access:\n", user_info);
    return new (error as any)(
      403,
      "Forbidden access, while editing user password."
    );
  }

  //   console.log("api/user/editpwd/: \n", given_email, given_pfp_url, given_pwd_hash, given_userid, given_username);

  let { data: result, error: _error } = await supabase.rpc("edit_passwd", {
    given_new_pwd_hash,
    given_old_pwd_hash,
    given_userid,
  });

  // console.log("add key rps result",result)
  if (_error) {
    console.log(
      "ERROR @api/user/editpwd:59: supabase edit user pwd error\n",
      _error
    );
    return new (error as any)(
      500,
      "Internal Server Error, while editing user pwd."
    );
  }

  let response: Response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}

