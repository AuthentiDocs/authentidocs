<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client";
  import { page } from "$app/stores";
  import { common_fetch } from "$lib/fetch_func";
  import { source } from 'sveltekit-sse'

  const value = source('/api/user/notificationevent').select('message')

  let email = "";
  let password = "";
  common_fetch(
    "/api/user/verifykey",
    {
      key: '{"crv":"P-384","ext":true,"key_ops":["verify"],"kty":"EC","x":"tqfv0VW2jMAzcB2xVgdnY7cHZh5eXnd2VaEIzwEHYjShWJRPHITl4TRsElOZ8Hbn","y":"5taflozhKRG8-ao2MhjTMODXzfgagNRoAvEjh35HtIWZg1hlRdf-w9kQf7cHjXYH"}',
      orgid: "8137193e-876c-4c05-9768-b8a11cee9b14",
    },
    async (response: Response): Promise<void> => {
      let response_obj = await response.json();
      console.log(response_obj);
    }
  );
  console.log("sse value:", value);
</script>

<div>
  {#if $page.data.session?.user}
    <p>Signed in as {$page.data.session.user.email}</p>
    <button on:click={() => signOut()}>Sign out</button>
  {:else}
    <form>
      <label>
        Email
        <input name="email" type="email" bind:value={email} />
      </label>
      <label>
        Password
        <input name="password" type="password" bind:value={password} />
      </label>
      <button on:click={() => signIn("credentials", { email, password })}
        >Log in</button
      >
    </form>
  {/if}
</div>
