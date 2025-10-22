<script>
    import { connections } from "../../../../data.svelte";
    import EmphasizedButton from "../../../../EmphasizedButton.svelte";

</script>

<div class="demo-folder-container">
    
    <div class="instructions">
        if you don't have access to any of the supported assignment platforms, <br>
        you can enable demo mode to explore the app with sample data.
    </div>

    <div class="enable">
        <EmphasizedButton 
            text={connections.demoMode ? "demo mode enabled" : "enable demo mode"}
            color={connections.demoMode ? "#A3F7BF" : "#DEEBFF"}
            onclick={() => connections.demoMode = !connections.demoMode}
        />
    </div>
</div>

<style>
    .demo-folder-container {
        display: flex;
        flex-direction: column;
        gap: 1em;
        flex: 1;
    }

    .instructions {
        font-size: 18px;
        line-height: 1.5em;
    }

    .enable {
        margin-top: auto;
    }
</style>