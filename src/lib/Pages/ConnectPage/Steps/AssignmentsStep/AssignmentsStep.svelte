<script lang="ts">
    import type { Component } from "svelte";
    import EmphasizedCenterButton from "../../../../EmphasizedCenterButton.svelte";
    import CanvasFolder from "./CanvasFolder.svelte";
    import EdstemFolder from "./EdstemFolder.svelte";
    import GradescopeFolder from "./GradescopeFolder.svelte";
    import { fly } from "svelte/transition";
    import { connections } from "../../../../data.svelte";
    import DemoFolder from "./DemoFolder.svelte";

    let {
        advanceCallback = () => {}
    } = $props();

    let folders: { [key: string]: Component } = {
        canvas: CanvasFolder,
        edstem: EdstemFolder,
        gradescope: GradescopeFolder,
        demo: DemoFolder
    };

    let selectedFolderIndex: string = $state(Object.keys(folders)[0]);

</script>

<h1>
    where do you keep your assignments?
</h1>
<div class="assignments-folder-container">
    <div class="assigments-folder-tabs">
        {#each Object.keys(folders) as name, _}
            <button 
                class="folder-tab {selectedFolderIndex === name ? 'active' : ''}" 
                onclick={() => selectedFolderIndex = name}
            >
                {name}
            </button>
        {/each}
    </div>
    <div class="assignments-folder-content">
        {#key selectedFolderIndex}
            {@const FolderComponent = folders[selectedFolderIndex]}
            <FolderComponent />
        {/key}
    </div>
</div>
<div class="continue-button" in:fly={{ y:20, duration:300 }}>
    {#if connections.canvasConnected || connections.edstemConnected || connections.gradescopeConnected || connections.demoMode}
        <EmphasizedCenterButton text="continue" size="32px" onclick={() => advanceCallback()}></EmphasizedCenterButton>
    {/if}
</div>

<style>
    h1 {
        font-size: 40px;
        text-align: center;
    }

    .assignments-folder-container {
        width: 100%;
        overflow: hidden;
    }

    .folder-tab {
        padding: 0.2em;
        width: 7em;
        font-size: 20px;
        border: 2px solid black;
        z-index: 5;
        border-bottom: none;
        border-radius: 10px 10px 0 0;
        background: none;
        cursor: pointer;
        position: relative;
        opacity: 0.5;
    }

    .folder-tab.active {
        opacity: 1;
    }

    .folder-tab.active::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: white;
        z-index: 5px;
    }

    .assignments-folder-content {
        border: 2px solid black;
        border-radius: 4px;
        border-top-left-radius: 0px;
        height: 18em;
        padding: 1.5em;
        display: flex;
        flex-direction: column;
    }

    .continue-button {
        margin-top: 1em;
        display: flex;
        justify-content: center;
    }
</style>