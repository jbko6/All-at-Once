<script lang="ts">
    let { text = "next", color = "#DEEBFF", size="24px", ...attributes } = $props();
</script>

<div class="link-container" style="font-size: {size}">
    <div class="link-background" style="--color: {color};"></div>
    <button {...attributes}>
        {text}
    </button>
</div>

<style>
    .link-container {
        position: relative;
        width: fit-content;
    }

    button {
        padding: 0.2em 1em;
        font-size: inherit;
        border: none;
        background: none;
        cursor: pointer;
        z-index: 1;
    }

    .link-background {
        background: linear-gradient(to right, var(--color), transparent 70%);
        position: absolute;
        height: 100%;
        width: 200%;
        top: 0;
        z-index: -1;
        left: -50%;
        transition: left 0.2s ease, width 0.2s ease;
    }

    .link-container:hover .link-background {
        left: -50%;
        width: 500%;
    }
</style>