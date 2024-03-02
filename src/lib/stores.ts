import type { LiveNotification } from "$lib/notification";
import { writable, type Readable, type Writable, readable } from "svelte/store";

export const new_key: Writable<boolean> = writable(false);
export const logged_in_store: Writable<boolean> = writable(false);
export const uid: Writable<string> = writable("");
export const username: Writable<string> = writable("");
export const useremail: Writable<string> = writable("");
export const priv_key: Writable<CryptoKey | null> = writable(null);
export const notifications: Writable<LiveNotification[]> = writable([]);
export const update_thread: Writable<boolean> = writable(false);
export const file_preview_mode: Writable<Number> = writable(0);
export const search_mode_names: Readable<string[]> = readable(["Users", "Threads", "Teams", "Organisations", "Notices"]);