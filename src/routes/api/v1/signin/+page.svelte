<script lang="ts">
  import { signIn, signOut } from "@auth/sveltekit/client";
  import { page } from "$app/stores";
  import { common_fetch } from "$lib/fetch_func";
  import { source } from 'sveltekit-sse'

  const value = source('/api/user/notificationevent').select('message')

  let email = "";
  let password = "";
  let userid = $page.data.session?.user?.name;
  common_fetch(
    "/api/files/getpersonalfiles_extension",
    {
      given_file_extension: "pdf",
      given_userid: userid
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
