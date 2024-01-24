import { supabase } from "$lib/server/supabase_client.server";
import type { RequestEvent } from "./$types";

export async function POST({ request }: RequestEvent): Promise<Response> {
    let user_mail = "vixoras298@ikuromi.com";
    let user_password = "testpassword";
const { data, error } = await supabase.auth.signInWithPassword({
  email: user_mail,
  password: user_password
})

    console.log(data);
    if(data.session == null)
    {
      console.log("Something wrong")
    }
    else
    {
        let given_email = user_mail;
        let given_pwd_hash=user_password;

        let { data:result, error } = await supabase
        .rpc('can_log_in_user', {
        given_email, 
        given_pwd_hash
        })
        if (error) console.error(error)
        else console.log(result)

    }
  
    let ret_text;
    let response: Response = new Response(JSON.stringify(ret_text), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    return response;
  }
  