import { supabase } from "$lib/server/supabase_client.server";
import type { RequestEvent } from "./$types";
import { json, error } from "@sveltejs/kit";



export async function POST({
  request,
  cookies,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, "You must sign in to add file signatures.");
  }
  const key_info = await request.json();
  console.log(key_info);
  let ret_text;
  let given_userid=key_info.user_id

    
let { data:result } = await supabase
.rpc('get_user_publickey_userid', {
  given_userid
})
console.log(result)


    ret_text=result;
   
   let response: Response = new Response(JSON.stringify(ret_text), {
    headers: {
      "Content-Type": "application/json",
    },
  });


  return response;
}