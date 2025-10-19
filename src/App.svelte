<script lang="ts">
    import { createContext, onMount, setContext } from "svelte";
    import ConnectPage from "./lib/Pages/ConnectPage/ConnectPage.svelte";
    import LandingPage from "./lib/Pages/LandingPage.svelte";
    import { SvelteURL } from "svelte/reactivity";
    import { connections } from "./lib/data.svelte";
    import PlanPage from "./lib/Pages/PlanPage/PlanPage.svelte";
    import Title from "./lib/Title.svelte";
    import { fade } from "svelte/transition";

    const url = new SvelteURL(window.location.href);

    addEventListener("hashchange", () => {
        url.href = window.location.href;
    });

    const apiLoaded = async () => {
        connections.gapiClient = google.accounts.oauth2.initTokenClient({
            client_id: '376302852820-d16v40rksb0a2abqha80rhshol4s8sgr.apps.googleusercontent.com',
            callback: (response) => {
                connections.gapiToken = response.access_token;
            },
            scope: 'https://www.googleapis.com/auth/calendar'
        });
        connections.gapiInitialized = true;
    };

    $inspect(connections.gapiToken, (val: string) => {
        if (val) {
            console.log("GAPI Token:", val);
        }
    });

</script>

<main>
    {#if url.hash.includes("#connect")}
        {#if connections.gapiInitialized }
            <ConnectPage />
        {/if}
    {:else if url.hash.includes("#plan")}
        <PlanPage />
    {:else if url.hash.includes("#done")}
        <div in:fade={{ duration: 400, delay: 400 }}>
            <h1 style="text-align: center;">All done!</h1>
            <div>Your assignments have been successfully planned!</div>
            <div style="position: absolute; top: 3em; left: 5em;">
                <Title  />
            </div>
        </div>
    {:else}
        <LandingPage />
    {/if}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        justify-content: center;
        height: 97vh;
        width: 97vw;
        position: relative;
    }
</style>

<svelte:head>
    <script src="https://accounts.google.com/gsi/client" async onload={apiLoaded}></script>
</svelte:head>