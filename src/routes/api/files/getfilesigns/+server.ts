import { supabase } from "$lib/server/supabase_client.server";
import type { RequestEvent } from "./$types";
import { json, error } from "@sveltejs/kit";



export async function POST({
  request,
  cookies,
  locals,
}: RequestEvent): Promise<Response> {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, "You must sign in to add file signatures.");
  }
  const file_info = await request.json();
  // console.log(key_info);
  let ret_text;
  let given_fileid=file_info.fileid
  let given_userid=file_info.user_id

    


  let { data:result } = await supabase
  .rpc('get_personal_file_signatures_fileid', {
    given_fileid, 
    given_userid
  })
if (error) console.error(error)
else console.log(result)

// console.log(result)



    ret_text=result;
   
   let response: Response = new Response(JSON.stringify(ret_text), {
    headers: {
      "Content-Type": "application/json",
    },
  });


  return response;
}