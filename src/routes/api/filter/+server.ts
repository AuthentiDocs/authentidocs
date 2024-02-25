import { supabase } from '$lib/server/supabase_client.server';
import type { Session } from '@auth/sveltekit';
import { error, json } from '@sveltejs/kit';

export async function POST({request, locals}): Promise<Response>
{
    let session: Session | null = await locals.auth();

    if(session === null)
    {
        return json({success: -1});
    }

    let owner: string | null | undefined = session.user?.name;

    if(owner === null || owner === undefined)
    {
        return json({success: -2});
    }

    let request_obj: any = await request.json();
    let { data: result, error: _error } = await supabase.rpc(
    "get_file_data_39",
    {
        owner_id: owner,
        type: request_obj.type
    });

    if(_error)
    {
        console.error(_error);

        return json({success: -3});
    }

    return json(
    {
        success: 0,
        files: result
    });
}