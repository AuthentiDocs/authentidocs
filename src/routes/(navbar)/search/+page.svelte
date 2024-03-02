<script lang="ts">
    import { page } from "$app/stores";
    import List from "$lib/components/list.svelte";
    import MemberCard from "$lib/components/member-card.svelte";
    import Thread from "$lib/components/home/thread-card.svelte";
    import Team from "$lib/components/home/team-card.svelte";
    import OrgCard from "$lib/components/home/org-card.svelte";
    import Notice from "$lib/components/notice.svelte";
    import { Entity, MemberObj } from "$lib/containers";
    import { afterNavigate } from "$app/navigation";
    import { search_mode_names } from "$lib/stores";

    let users: MemberObj[] = [];
    let threads: Entity[] = [];
    let teams: Entity[] = [];
    let orgs: Entity[] = [];
    let notices: Entity[] = [];
    let mode: number = 0;

    afterNavigate((): void =>
    {
        let temp_mode: string | null = $page.url.searchParams.get("mode");
        let temp_query: string | null = $page.url.searchParams.get("query");

        if(temp_mode !== null && temp_query !== null)
        {
            mode = parseInt(temp_mode);
            let query: string = temp_query;
            users = [];
            threads = [];
            teams = [];
            orgs = [];
            notices = [];

            if(mode === 0)
            {
                fetch("/api/search/user",
                {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        term: query
                    })
                }).then(async (response: Response): Promise<void> =>
                {
                    let response_obj: any = await response.json();
                    users = new Array(response_obj.length);

                    for(let i: number = 0; i < users.length; ++i)
                    {
                        users[i] = new MemberObj();
                        users[i].id = response_obj[i].f_userid;
                        users[i].name = response_obj[i].f_username;
                        users[i].joined = new Date(response_obj[i].f_created_at);
                        users[i].pubkey = response_obj[i].f_publickey;
                    }
                });
            }
            else if(mode === 1)
            {
                fetch("/api/search/thread",
                {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        term: query
                    })
                }).then(async (response: Response): Promise<void> =>
                {
                    let response_obj: any = await response.json();
                    threads = new Array(response_obj.length);

                    for(let i: number = 0; i < threads.length; ++i)
                    {
                        threads[i] = new Entity();
                        threads[i].uid = response_obj[i].f_threadid;
                        threads[i].name = response_obj[i].f_threadname;
                    }
                });
            }
            else if(mode === 2)
            {
                fetch("/api/search/team",
                {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        term: query
                    })
                }).then(async (response: Response): Promise<void> =>
                {
                    let response_obj: any = await response.json();
                    teams = new Array(response_obj.length);

                    for(let i: number = 0; i < teams.length; ++i)
                    {
                        teams[i] = new Entity();
                        teams[i].uid = response_obj[i].f_teamid;
                        teams[i].name = response_obj[i].f_team_name;
                    }
                });
            }
            else if(mode === 3)
            {
                fetch("/api/search/org",
                {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        term: query
                    })
                }).then(async (response: Response): Promise<void> =>
                {
                    let response_obj: any = await response.json();
                    orgs = new Array(response_obj.length);

                    for(let i: number = 0; i < orgs.length; ++i)
                    {
                        orgs[i] = new Entity();
                        orgs[i].uid = response_obj[i].f_orgid;
                        orgs[i].name = response_obj[i].f_org_name;
                    }
                });
            }
            else if(mode === 4)
            {
                fetch("/api/search/notice",
                {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        term: query
                    })
                }).then(async (response: Response): Promise<void> =>
                {
                    let response_obj: any = await response.json();

                    console.log(response_obj);

                    notices = new Array(response_obj.length);

                    for(let i: number = 0; i < notices.length; ++i)
                    {
                        notices[i] = new Entity();
                        notices[i].uid = response_obj[i].f_noticeid;
                        notices[i].name = response_obj[i].f_subject;
                    }
                });
            }
        }
    });
</script>

<div class="search-root">
    <div class="cards title-card block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-2">
        <p class="text-3xl font-semibold text-gray-700 dark:text-gray-200">Found {$search_mode_names[mode]}</p>
    </div>
    <div class="cards result-list block p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        {#if mode === 0}
            <List loaded={true} empty={users.length === 0}>
                {#each users as user}
                    <li>
                        <MemberCard id={user.id} name={user.name} joined_at={user.joined} pub_key={user.pubkey} />
                    </li>                
                {/each}
            </List>
        {:else if mode === 1}
            <List loaded={true} empty={threads.length === 0}>
                {#each threads as thread}
                    <li>
                        <Thread thread_id={thread.uid} thread_name={thread.name} />
                    </li>                
                {/each}
            </List>
        {:else if mode === 2}
            <List loaded={true} empty={teams.length === 0}>
                {#each teams as team}
                    <li>
                        <Team team_id={team.uid} team_name={team.name} />
                    </li>
                {/each}
            </List>
        {:else if mode === 3}
            <List loaded={true} empty={orgs.length === 0}>
                {#each orgs as org}
                    <li>
                        <OrgCard uid={org.uid} name={org.name} />
                    </li>
                {/each}
            </List>
        {:else if mode === 4}
            <List loaded={true} empty={notices.length === 0}>
                {#each notices as notice}
                    <li>
                        <Notice uid={notice.uid} title={notice.name} />
                    </li>
                {/each}
            </List>
        {/if}
    </div>
</div>

<style>
    .search-root
    {
        position: absolute;
        top: 5.5rem;
        bottom: 1rem;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .cards
    {
        width: 65rem;
    }
    .title-card
    {
        height: fit-content;
    }
    .result-list
    {
        flex-grow: 1;
        overflow-y: auto;
    }
</style>