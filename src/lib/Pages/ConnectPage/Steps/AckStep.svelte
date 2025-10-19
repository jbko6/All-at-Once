<script>
    import EmphasizedCenterButton from "../../../EmphasizedCenterButton.svelte";

    let {
        advanceCallback = () => {}
    } = $props();

</script>

<div class="ack-step-container">
    <h1>
        we need to connect to your things
    </h1>
    <EmphasizedCenterButton text="got it" size="32px" onclick={() => advanceCallback()}></EmphasizedCenterButton>
</div>

<style>
    .ack-step-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2em;
        text-align: center;
    }

    h1 {
        font-size: 40px;
    }
</style>