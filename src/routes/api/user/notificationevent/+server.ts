// src/routes/custom-event/+server.js
import { events } from "sveltekit-sse";
import { supabase } from "$lib/server/supabase_client.server";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import dotenv from 'dotenv'
import jwt, { type Secret } from 'jsonwebtoken';
dotenv.config()

/**
 * @param {number} milliseconds
 * @returns
 */
function delay(milliseconds: number) {
  return new Promise(function run(resolve) {
    setTimeout(resolve, milliseconds);
  });
}

export async function POST({ request, cookies, locals }: RequestEvent) {
  const session = await locals.auth();
  if (!session?.user) {
    return new (error as any)(401, "You must be logged in to add public key");
  }

  let given_userid = session.user.name;

  return events({
    request,
    async start({ emit }) {
      // let token: string  = cookies.get("authjs.session-token") as string;
      // console.log(token)
      // console.log("done")
      // let {AUTH_SECRET} = process.env;
      // console.log("auth: ", AUTH_SECRET)
      // let decoded_token:any = jwt.verify(token, AUTH_SECRET as Secret)
      // console.log(decoded_token);
      // let user_info = await request.json();
      // let given_userid = user_info.userid;
      // if (given_userid === undefined || given_userid === null) {
      //   console.log("ERROR @api/user/notificationevent:31: invalid input");
      //   emit("error", JSON.stringify({ message: "invalid inputs" }));
      // }
      while (true) {
        let { data: result1, error: error1 } = await supabase.rpc(
          "are_there_notifications",
          {
            given_userid,
          }
        );
        
        if (error1) {
          console.log(
            "ERROR @api/user/notificationevent:54: supabase checking user notification error\n",
            error1
          );

          emit(
            "error",
            JSON.stringify({
              message: "Internal server error while checking notification",
            })
          );
        }

        if (result1) {
          let { data: result2, error: _error } = await supabase.rpc(
            "get_user_unsent_notifications",
            {
              given_userid,
            }
          );

          if (_error) {
            console.log(
              "ERROR @api/user/getnotifications:75: supabase getting user notification error\n",
              _error
            );
            return new (error as any)(
              500,
              "Internal Server Error, while getting user notifications."
            );
          }

          emit("notifications", JSON.stringify(result2));
        }

        await delay(1000);
      }
    },
  });
}
