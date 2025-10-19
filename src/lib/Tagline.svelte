<script lang="ts">
    import { fade } from "svelte/transition";


    const hooks = [
        'breathe',
        'focus',
        'create',
        'relax',
        'think',
        'explore',
        'build',
        'connect',
        'learn',
        'grow'
    ]

    let hookIndex = $state(Math.floor(Math.random() * hooks.length));

    setInterval(() => {
        const nextIndex = Math.floor(Math.random() * hooks.length);
        hookIndex = nextIndex;
    }, 4000);

    function morph(node: HTMLElement, { duration = 400, delay = 0 } = { duration: 400, delay: 0 }) {
        const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;
        if (!valid) {
            throw new Error(`This transition only works on elements with a single text node child`);
        }

        return {
            duration,
            delay,
            css: (t: number, u: number) => `
                filter: blur(${Math.min(8 / t - 8, 100)}px);
                opacity: ${Math.pow(t, 0.4) * 100}%;
            `
        }
    }
</script>

<h1 class="tagline">
    you're busy. <br>
    let's get you more time to <span class="changing-hook-container">{#key hookIndex}
        <span class="changing-hook" transition:morph>
            {hooks[hookIndex]}.
        </span>
    {/key}</span>
</h1>

<svg id="filters">
    <defs>
        <filter id="threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="
                                    1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 255 -110" />
        </filter>
    </defs>
</svg>

<style>
    .tagline {
        font-size: 64px;
        filter: url("#threshold") blur(0.6px);
    }

    .changing-hook-container {
        position: relative;
        display: inline-block;
        height: 1.115em;
        
    }

    .changing-hook {
        position: absolute;
        text-decoration: underline;
        filter: blur(0px);
        opacity: 100%;
    }

    svg {
        position: absolute;
    }
</style>