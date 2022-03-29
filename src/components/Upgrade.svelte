<script>
  import { save } from "../stores/save.js";
  import { format } from "../lib/functions.js";
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";

  const dispatch = createEventDispatcher();
  export let upgrade;

  const tiers = {
    1: "bg-gray-300",
    2: "bg-green-300",
    3: "bg-blue-300",
    4: "bg-purple-300",
    5: "bg-orange-300",
  };

  $: affordable = $save.balance >= upgrade.price;

  let prompt = false;

  const romanNumerals = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
  };

  const purchase = () => {
    $save.balance -= upgrade.price;
    $save.ownedUpgrades.push(upgrade.id);
    prompt = false;
    dispatch("purchase");
  };
</script>

{#if prompt}
  <div class="overlay bg-black" transition:fade={{ duration: 500 }} />
  <div class="flex flex-col mx-auto max-w-sm pr-4 z-50 fixed top-1/4 w-full ">
    <div
      class="rounded-md border-2 border-black {tiers[
        upgrade.tier
      ]}"
      transition:fly={{ y: 200, duration: 500 }}
    >
      <div class="flex px-2 pt-2">
        <h1 class="text-5xl pr-2">{upgrade.emoji}</h1>
        <div class="flex flex-col">
          <h1 class="text-xl font-medium">{upgrade.name} {romanNumerals[upgrade.tier]}</h1>
          <div class="flex justify-between items-baseline">
            <h1 class="pr-2">
              {upgrade.category} Upgrade
            </h1>
          </div>
        </div>
      </div>

      <p class="px-2 py-2 text-md">{upgrade.desc}</p>
      <div class="flex px-2 pb-2 justify-between select-none">
        <div
          on:click={() => {
            prompt = false;
          }}
          class="bg-red-400 w-1/2 mr-1 p-2 border-2 border-black flex flex-col justify-center align-middle rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
        >
          <h1 class="font-medium text-lg text-center">Cancel</h1>
        </div>
        <div
          on:click={purchase}
          class="bg-green-400 w-1/2 ml-1 p-2 border-2 border-black rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
        >
          <h1 class="font-medium text-lg text-center">Purchase</h1>
          <h1 class="font-mono text-center">
            {format(upgrade.price, 0)} HNS
          </h1>
        </div>
      </div>
    </div>
  </div>
{/if}

<div
  class="rounded-md border-black border-2 m-2 w-12 h-12 text-3xl align-middle justify-center items-baseline {tiers[
    upgrade.tier
  ]} select-none {affordable
    ? ' cursor-pointer transition-transform transform-gpu motion-safe:hover:scale-110 motion-safe:active:scale-95 '
    : 'opacity-50 cursor-not-allowed'}"
  on:click={() => (affordable ? (prompt = true) : (prompt = false))}
>
  <h1 class="text-center pt-1">{upgrade.emoji}</h1>
</div>

<style>
  .overlay {
    opacity: 0.8;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    z-index: 50;
  }
</style>
