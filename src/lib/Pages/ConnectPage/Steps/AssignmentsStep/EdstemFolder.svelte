<script>
    import { connections } from "../../../../data.svelte";
    import EmphasizedButton from "../../../../EmphasizedButton.svelte";

    const checkConnection = async () => {
        await fetch("https://cloudflare-cors-anywhere.jonahkowal.workers.dev/?https://us.edstem.org/api/user", {
            headers: {
                "Authorization": `Bearer ${connections.edstemToken}`,
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.ok) {
                connections.edstemConnected = true;
            } else {
                connections.edstemConnected = false;
            }
        });
    }

</script>

<div class="edstem-folder-container">
    
    <div class="instructions">
        you’ll need to<br>
        <br>
        → go to your <a href="https://edstem.org/us/settings/api-tokens" target="_blank">api tokens</a><br>
        → generate a new access token<br>
        → paste the token here
    </div>

    <div class="token-input-container">
        <label for="edstem-token">your access token</label><br>
        <input
            type="password"
            autocomplete="off"
            id="edstem-token"
            placeholder="paste it here"
            oninput={() => connections.edstemConnected = false}
            bind:value={connections.edstemToken}
        />
    </div>

    <EmphasizedButton 
        text={connections.edstemConnected ? "connected!" : "connect"}
        color={connections.edstemConnected ? "#A3F7BF" : "#DEEBFF"}
        onclick={checkConnection}
    />
</div>

<style>
    a {
        color: inherit;
        text-decoration: underline;
    }

    a:visited {
        color: inherit;
    }

    .edstem-folder-container {
        display: flex;
        flex-direction: column;
        gap: 1em;
        flex: 1;
    }

    .instructions {
        font-size: 18px;
        line-height: 1.5em;
    }

    label {
        font-size: 18px;
    }

    input {
        margin-top: 0.5em;
        padding: 0.5em;
        font-size: 18px;
        width: 100%;
        box-sizing: border-box;
        border-radius: 4px;
        border: 1px solid #ccc;
    }

    input:focus {
        outline: none;
        border-color: #999;
    }
</style>