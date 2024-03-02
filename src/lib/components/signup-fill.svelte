<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";
  import { common_fetch } from "$lib/fetch_func";
  import { onMount } from "svelte";

  export let signup_card_content_div: HTMLDivElement;
  export let form: HTMLFormElement;
  export let on_card_content_load: () => void;
  export let user_exist: boolean;
  let email: string = "";
  let username: string = "";
  let password: string = "";
  let password_verify: string = "";

  async function signup(): Promise<void> {
    if (password === password_verify) {
      let subtle_crypto: SubtleCrypto = window.crypto.subtle;
      let text_encoder: TextEncoder = new TextEncoder();
      let password_buffer: ArrayBuffer = await subtle_crypto.digest(
        "SHA-256",
        text_encoder.encode(password),
      );
      let password_hash: string = [...new Uint8Array(password_buffer)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");

      let request_obj: any = {
        given_email: email,
        given_username: username,
        given_pwd_hash: password_hash,
      };
      common_fetch(
        "/api/user/signup",
        request_obj,
        async (response: Response): Promise<void> => {
          let response_obj: any = await response.json();

          // console.log(response_obj);

          if (response_obj !== -1) {
            // new_key.set(true);
            window.localStorage.setItem("new_key", "1");
            signIn("credentials",
            {
              email: email,
              password: password_hash,
              callbackUrl: "/home",
            });
          } else {
            location.href = "/signup?error";
          }
        },
      );
    } else {
    }
  }

  onMount((): void => {
    on_card_content_load();
  });
</script>

<div class="signup-card-content" bind:this={signup_card_content_div}>
  <p class="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
    Sign Up
  </p>
  <form bind:this={form} on:submit={signup}>
    <div class="relative z-0 w-full mb-5 group">
      <input
        bind:value={email}
        type="email"
        id="signup-email"
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        required
      />
      <label
        for="signup-email"
        class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >Email address</label
      >
    </div>
    <div class="relative z-0 w-full mb-5 group">
      <input
        bind:value={username}
        type="text"
        id="signup-name"
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        required
      />
      <label
        for="signup-name"
        class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >Name</label
      >
    </div>
    <div class="grid md:grid-cols-2 md:gap-6">
      <div class="relative z-0 w-full mb-5 group">
        <input
          bind:value={password}
          type="password"
          id="signup-password"
          class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          minlength="8"
          required
        />
        <label
          for="signup-password"
          class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >Password</label
        >
      </div>
      <div class="relative z-0 w-full mb-5 group">
        <input
          bind:value={password_verify}
          type="password"
          id="signup-repeat-password"
          class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          required
        />
        <label
          for="signup-repeat-password"
          class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >Confirm password</label
        >
      </div>
    </div>
    {#if user_exist}
      <p class="mt-2 text-sm text-red-600 dark:text-red-500">
        <span class="font-medium">User Exists!</span>
      </p>
    {/if}
    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
      Already a user? <a
        href="/login"
        class="font-medium text-blue-600 hover:underline dark:text-blue-500"
        >Login</a
      >
    </p>
    <div class="flex flex-row-reverse items-center">
      <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ms-2"
        >Sign Up</button>
      <a href="/" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Home</a>
    </div>
  </form>
</div>

<style>
  .signup-card-content {
    opacity: 0;
  }
</style>
