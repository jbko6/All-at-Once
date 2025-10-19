<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";

    let {
        text = "Click Me",
        color = "#DEEBFF",
        size = "24px",
        ...attributes
    }: {
        text?: string;
        color?: string;
        size?: string;
    } & HTMLButtonAttributes = $props();
</script>

<div class="emphasized-center-button-container" style="font-size: {size};">
    <div class="button-background" style="--color: {color};"></div>
    <button {...attributes}>
        {text}
    </button>
</div>

<style>
    .emphasized-center-button-container {
        position: relative;
        width: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button {
        padding: 0.2em 1em;
        font-size: inherit;
        border: none;
        background: none;
        cursor: pointer;
        z-index: 1;
    }

    .button-background {
        background: linear-gradient(to right, transparent 20%, var(--color), transparent 80%);
        position: absolute;
        height: 100%;
        width: 500%;
        top: 0;
        z-index: 0;
        left: -200%;
        transition: left 0.2s ease, width 0.2s ease;
    }

    .emphasized-center-button-container:hover .button-background {
        left: -300%;
        width: 700%;
    }
</style>