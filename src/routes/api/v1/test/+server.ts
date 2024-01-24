
import { supabase } from "$lib/server/supabase_client.server";


import dotenv from 'dotenv'
dotenv.config()
let {NODE_ENV,VERCEL_ENV,VERCEL_BRANCH_URL} = process.env
const getURL = () => {
  let url =''
  if(VERCEL_ENV == undefined)
{
  if(NODE_ENV=='production')
{
  url = 'http://localhost:4173/'
}
else
{
  url = 'http://localhost:5173/'
}
}
else
{
  if(VERCEL_ENV=='production')
  {
    url = 'https://authentidocs.vercel.app/'
  }
  else
  {
    url = 'https://' + VERCEL_BRANCH_URL
  }

}
  // // Make sure to include `https://` when not localhost.
  // url = url.includes('http') ? url : `https://${url}`
  // // Make sure to include a trailing `/`.
  // url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  return url
}



export async function GET(): Promise<Response> {
    let ret_text;
    ret_text = {ret_text:"Hello from AuthentiDocs team. The server is alive still ."}
    // const { data } = await supabase.from("user_data").select();
    // console.log(data);
    //console.log(error);
    let user_mail = "vixoras298@ikuromi.com";
    let user_password = "testpassword";
    let uid=''
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
        uid = data.user.id;
        let { data:result, error } = await supabase
        .rpc('can_log_in_user', {
        given_email, 
        given_pwd_hash
        })
        if (error) console.error(error)
        else console.log(result)
      if(result==false)
      {
      let given_email=user_mail 
      let given_pfp_url='aaaaaa' 
      let given_publickey='aaaa' 
      let given_pwd_hash=user_password 
      let given_userid=uid 
      let given_username='test'

      
        let { data, error } = await supabase
        .rpc('add_user', {
          given_email, 
          given_pfp_url, 
          given_publickey, 
          given_pwd_hash, 
          given_userid, 
          given_username
        })
        if (error) console.error(error)
        else console.log(data)
    }
    else
    {
      console.log("Not First time insert")
    }


      }

    

    return new Response(JSON.stringify(ret_text), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
 