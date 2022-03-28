<script>
  import { format } from "../lib/functions.js";
  import { save } from "../stores/save.js";
  import { Howl } from "howler";
  import party from "party-js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let building;

  let buildingDiv;

  const buy = (building) => {
    let price =
      building.basePrice *
      Math.pow(1.15, $save.ownedBuildings[building.id] ?? 0);

    if ($save.balance < price) return;

    $save.balance -= price;
    $save.stats.buildingsPurchased ++;

    if ($save.ownedBuildings[building.id] === undefined) {
      party.confetti(buildingDiv);
    }

    if (!$save.ownedBuildings[building.id]) {
      $save.ownedBuildings[building.id] = 1;
    } else {
      $save.ownedBuildings[building.id] += 1;
    }

    dispatch("buy");
  };
  const sell = (building) => {
    if (!$save.ownedBuildings[building.id]) return;

    let refund =
      (building.basePrice * Math.pow(1.15, $save.ownedBuildings[building.id] ?? 0)) /
      4;

    $save.balance += refund;
    $save.stats.hnsAllTime += refund;
    $save.stats.buildingsSold ++;

    $save.ownedBuildings[building.id] -= 1;

    dispatch("sell");
  };
</script>

<div class="border-2 border-black rounded-md mb-4" bind:this={buildingDiv}>
  <div class="flex px-2 pt-2">
    <h1 class="text-5xl pr-2">{building.emoji}</h1>
    <div class="flex flex-col">
      <h1 class="text-xl font-medium">{building.name}</h1>
      <div class="flex justify-between items-baseline">
        <h1 class="text-gray-500 pr-2">
          Rate: <span class="font-mono">{format(building.rate)} HNS/s</span>,
        </h1>
        <h1 class="text-gray-500">
          Owned: <span class="font-mono"
            >{($save.ownedBuildings[building.id] ?? 0).toLocaleString()}</span
          >
        </h1>
      </div>
    </div>
  </div>

  <p class="px-2 py-2 text-sm">{building.desc}</p>
  <div class="flex px-2 pb-2 justify-between">
    <div
      on:click={() => {
        buy(building);
      }}
      id="building-{building.id}"
      class="bg-green-400 w-1/2 mr-1 p-2 border-2 border-black rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
    >
      <h1 class="font-medium text-lg">Buy</h1>
      <h1 class="font-mono">
        {format(
          building.basePrice *
            Math.pow(1.15, $save.ownedBuildings[building.id] ?? 0)
        )} HNS
      </h1>
    </div>

    <div
      on:click={() => {
        sell(building);
      }}
      class="bg-red-400 w-1/2 ml-1 p-2 border-2 border-black rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
    >
      <h1 class="font-medium text-lg">Sell</h1>
      <h1 class="font-mono">
        {$save.ownedBuildings[building.id]
          ? format(
              (building.basePrice *
                Math.pow(1.15, $save.ownedBuildings[building.id] ?? 0)) /
                4
            ) + " HNS"
          : "N/A"}
      </h1>
    </div>
  </div>
</div>
