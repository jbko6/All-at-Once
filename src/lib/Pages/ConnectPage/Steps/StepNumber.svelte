<script lang="ts">
    let { number = 1, active = true, radius = 30 } = $props();
</script>

<div
    class="step-number-container"
    style="opacity: {active ? 1 : 0.5}; width: {radius * 2 +
        10}px; height: {radius * 2 + 10}px;"
>
    <div class="step-number" style="font-size: {radius * 1.5}px;">
        {number}
    </div>
    <svg class="step-circle" width={radius * 2 + 10} height={radius * 2 + 10}>
        <circle
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
            stroke="black"
            stroke-width="4"
            fill="none"
        />
    </svg>
</div>

<style>
    .step-number-container {
        position: relative;
    }

    .step-number {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: black;
        z-index: 1;
        font-family: var(--font-mono);
    }

    .step-circle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>
