<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import Title from "../../Title.svelte";
    import AckStep from "./Steps/AckStep.svelte";
    import AssignmentsStep from "./Steps/AssignmentsStep/AssignmentsStep.svelte";
    import GApiStep from "./Steps/GApiStep.svelte";
    import StepNumber from "./Steps/StepNumber.svelte";
    import type { Component } from "svelte";


    const steps: Component<{advanceCallback: () => void}>[] = [AckStep, GApiStep, AssignmentsStep];
    let currentStepIndex = $state(0);

    addEventListener("hashchange", () => {
        const hash = window.location.hash;
        if (hash.includes("#connect")) {
            currentStepIndex = hash.split("#connect-")[1] ? parseInt(hash.split("#connect-")[1]) - 1 : 0;
        }
    });

    $effect(() => {
        window.location.hash = `#connect-${currentStepIndex + 1}`;
    });
    
</script>

<div class="connect-page-container" in:fly|global={{ y: 20, duration: 400, delay: 400 }} >
    <header in:fade|global={{ duration: 500, delay: 800 }} out:fade|global={{ duration: 200 }}>
        <Title />
    </header>
    <div class="steps-container" out:fly|global={{ y: -20, duration: 400 }}>
        {#key currentStepIndex}
            {@const StepComponent = steps[currentStepIndex]}
            <div class="steps" out:fly={{ y:-20, duration: 300 }} in:fly={{ y:20, duration: 300, delay: 300 }}>
                <div class="current-step" >
                    <StepNumber number={currentStepIndex + 1} active={true} />
                    <StepComponent advanceCallback={() => {
                        if (currentStepIndex < steps.length - 1) {
                            currentStepIndex += 1;
                        } else {
                            location.hash = "#plan";
                        }
                    }} />
                </div>
                {#if currentStepIndex < steps.length - 1}
                    <div class="future-step">
                        <StepNumber number={currentStepIndex + 2} active={false} />
                        <svg class="future-step-ellipsis" opacity="0.5" width="8" height="48">
                            <circle cx="3" cy="5" r="3" fill="black" />
                            <circle cx="3" cy="25" r="3" fill="black" />
                            <circle cx="3" cy="45" r="3" fill="black" />
                        </svg>
                    </div>
                {/if}
            </div>
        {/key}
    </div>
</div>

<style>

    .connect-page-container {
        position: absolute;
        height: 90%;
        top: 0;
        width: 100%;
        overflow: visible;
        gap: 4em;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    header {
        position: absolute;
        top: 3em;
        left: 5em;
        z-index: 5;
    }

    .steps-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .steps {
        position: absolute;
        top: 25%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2em;
    }

    .current-step {
        display: flex;
        flex-direction: column;
        min-height: 20em;
        align-items: center;
    }

    .future-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;
        opacity: 0.5;
    }

</style>