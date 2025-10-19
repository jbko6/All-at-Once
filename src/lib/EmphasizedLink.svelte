<script lang="ts">
    let { href = "#", text = "next", color = "#DEEBFF" } = $props();
</script>

<div class="link-container">
    <div class="link-background" style="--color: {color};"></div>
    <a href={href}>
        {text} <span class="arrow">→</span>
    </a>
</div>

<style>
    .link-container {
        position: relative;
        width: fit-content;
    }

    a {
        font-size: 32px;
        color: inherit;
        text-decoration: none;
    }

    a:visited {
        color: inherit;
    }

    .arrow {
        font-weight: 800;
    }

    .link-background {
        background: linear-gradient(to right, var(--color), transparent 70%);
        position: absolute;
        height: 3em;
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