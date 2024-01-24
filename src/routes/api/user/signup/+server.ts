import { supabase } from "$lib/server/supabase_client.server";
import type { RequestEvent } from "./$types";

import dotenv from "dotenv";
dotenv.config();
let { NODE_ENV, VERCEL_ENV, VERCEL_BRANCH_URL } = process.env;
const getURL = () => {
  let url = <string>'sd';
  if (VERCEL_ENV == undefined) {
    if (NODE_ENV == "production") {
      url = "http://localhost:4173/";
    } else {
      url = "http://localhost:5173/";
    }
  } else {
    if (VERCEL_ENV == "production") {
      url = "https://authentidocs.vercel.app/";
    } else {
      url = "https://" + VERCEL_BRANCH_URL;
    }
  }
  return url;
};

export async function POST({ request }: RequestEvent): Promise<Response> {
  let user_mail = "vixoras298@ikuromi.com";
  let user_password = "testpassword";
  const { data, error } = await supabase.auth.signUp({
    email: user_mail,
    password: user_password,
    options: {
      emailRedirectTo: <string>getURL(),
    },
  });
  console.log(data);
  if(data.user == null)
  {
    console.log("User already exists")
  }

  let ret_text;
  let response: Response = new Response(JSON.stringify(ret_text), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}
