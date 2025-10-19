<script>
    import { fly, slide } from "svelte/transition";
    import EmphasizedLink from "../EmphasizedLink.svelte";
    import Tagline from "../Tagline.svelte";
    import Title from "../Title.svelte";

</script>

<div class="landing-container" out:fly={{ x: 40, duration: 400 }} in:fly={{ x: -40, duration: 400, delay: 200 }}>
    <Title />
    <Tagline />
    <EmphasizedLink href="#connect" text="i'm ready"/>
</div>

<style>
    .landing-container {
        position: absolute;
        width: 100%;
        padding: 5em 5em 10em;
        box-sizing: border-box;
    }
</style>