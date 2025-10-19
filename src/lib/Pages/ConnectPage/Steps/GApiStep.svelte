<script lang="ts">
    import { onMount } from "svelte";
    import { connections } from "../../../data.svelte";
    import EmphasizedCenterButton from "../../../EmphasizedCenterButton.svelte";

    let {
        advanceCallback = () => {}
    } = $props();

    onMount(() => {
        google.accounts.id.renderButton(
            document.querySelector(".g-button") as HTMLElement,
            {
                theme: "outline", 
                size: "large", 
                type: "standard"
            }
        );
    });

    let callbackCalled = false;

    $effect.pre(() => {
        if (connections.gapiToken.length > 0 && !callbackCalled) {
            advanceCallback();
            callbackCalled = true;
        }
    })

</script>

<div class="google-step-container">
    <div class="text">
        <h1>
            let's connect to your calendar
        </h1>
        <div>
            we only support google calendar at the moment
        </div>
    </div>
    <EmphasizedCenterButton onclick={() => {
        connections.gapiClient!.requestAccessToken();
    }} text="authorize"></EmphasizedCenterButton>
</div>

<style>
    .google-step-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2em;
        text-align: center;
    }

    h1 {
        font-size: 40px;
        margin-bottom: 0.2em;
    }
</style>