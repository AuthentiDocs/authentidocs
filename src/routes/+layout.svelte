<script lang="ts">
    import "../app.pcss";
    import { db, type PriveKey } from "$lib/db";
    import { priv_key } from "$lib/stores";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { common_fetch } from "$lib/fetch_func";

    onMount(async (): Promise<void> =>
    {
        if($page.data.session)
        {
            let new_key_need: string | null = localStorage.getItem("new_key");

            if(new_key_need !== null && new_key_need === "1")
            {
                let subtle_crypto: SubtleCrypto = window.crypto.subtle;

                let keyPair = await subtle_crypto.generateKey(
                {
                    name: "ECDSA",
                    namedCurve: "P-384",
                },
                true,
                ["sign", "verify"],
                );

                let public_key = await subtle_crypto.exportKey(
                "jwk",
                keyPair.publicKey,
                );

                await db.priv_key.add({
                id: $page.data.session.user?.name as string,
                key: keyPair.privateKey,
                });

                let request_obj: any = {
                    user_id: $page.data.session?.user?.name,
                    key: JSON.stringify(public_key),
                };
                common_fetch(
                "/api/user/addkey",
                request_obj,
                async (response: Response): Promise<void> => {
                // new_key.set(false);
                console.log("layout add key response:",response)
                localStorage.setItem("new_key", "0");
                localStorage.setItem("pub_key", JSON.stringify(public_key));
                });
            }

            let temp_key: PriveKey | undefined = await db.priv_key.get($page.data.session.user?.name as string);

            if(temp_key)
            {
                priv_key.set(temp_key.key);
            }
        }
    });
</script>

<slot></slot>