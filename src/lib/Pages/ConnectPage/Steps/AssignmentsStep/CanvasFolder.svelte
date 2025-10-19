<script>
    import { connections } from "../../../../data.svelte";
    import EmphasizedButton from "../../../../EmphasizedButton.svelte";

    const checkConnection = async () => {
        await fetch("https://cloudflare-cors-anywhere.jonahkowal.workers.dev/?https://canvas.instructure.com/api/v1/users/self", {
            headers: {
                "Authorization": `Bearer ${connections.canvasToken}`,
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.ok) {
                connections.canvasConnected = true;
            } else {
                connections.canvasConnected = false;
            }
        });
    }

</script>

<div class="canvas-folder-container">
    
    <div class="instructions">
        you’ll need to<br>
        <br>
        → go to your account settings<br>
        → generate a new access token<br>
        → paste the access token here
    </div>

    <div class="token-input-container">
        <label for="canvas-token">your access token</label><br>
        <input 
            type="password" 
            autocomplete="off"
            id="canvas-token"
            placeholder="paste it here" 
            oninput={() => connections.canvasConnected = false}
            bind:value={connections.canvasToken}
        />
    </div>

    <EmphasizedButton 
        text={connections.canvasConnected ? "connected!" : "connect"}
        color={connections.canvasConnected ? "#A3F7BF" : "#DEEBFF"}
        onclick={checkConnection}
    />
</div>

<style>
    .canvas-folder-container {
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