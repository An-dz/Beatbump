<script lang="ts">
	import { fly, fade } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	import { clickOutside } from "$lib/actions/clickOutside";
	export let hasFocus = true;
	export let zIndex = 50;
	const dispatch = createEventDispatcher();
</script>

<svelte:window />
<div
	class="backdrop"
	on:click|self={() => dispatch("close")}
	transition:fade|global={{ duration: 125 }}
	style="z-index: {zIndex};"
>
	<div
		class="modal"
		aria-modal="true"
		on:click_outside={() => {
			if (!hasFocus) return;
			dispatch("close");
		}}
		use:clickOutside
		role="dialog"
		transition:fly|global={{ duration: 250, delay: 125 }}
	>
		<div class="modal-container">
			<slot name="header" />
			<slot />
		</div>
	</div>
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
