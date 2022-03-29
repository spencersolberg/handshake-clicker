<script>
  import { save } from "../stores/save.js";
  import { formatSmall } from "../lib/functions.js";
  import { browser } from "$app/env";
  import { fly, fade } from "svelte/transition";

  let saved = false;
  let copied = false;
  let imported = false;
  let prompt = false;
  let importString = "";
  let importPrompt = false;

  const saveGame = (isImport = false) => {
    if (!browser) return;
    $save.lastSave = new Date();
    localStorage.setItem("save", JSON.stringify($save));

    if (isImport) {
      imported = true;
      setTimeout(() => (imported = false), 4000);
      return;
    }
    saved = true;
    setTimeout(() => (saved = false), 4000);
  };

  const exportSave = () => {
    if (!browser) return;
    let string = JSON.stringify($save);
    let base64 = btoa(string);
    navigator.clipboard.writeText(base64).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 4000);
    });
  };

  const importSave = () => {
    if (!browser) return;
    let string = atob(importString);
    let importedSave = JSON.parse(string);
    if (Object.keys(importedSave).includes("clickMultiplier")) {
      $save = {
        balance: Number(importedSave.balance),
        ownedBuildings: importedSave.ownedBuildings,
        ownedUpgrades: [],
        settings: {
          audio: importedSave.audio,
          walletName: importedSave.walletName,
          autoSave: true,
          debug: false,
        },
        stats: {
          hnsAllTime: 0,
          hnsClicked: 0,
          timesClicked: 0,
          buildingsPurchased: 0,
          buildingsSold: 0,
          runStarted: new Date(),
        },
        lastSave: new Date(),
      };
    } else {
      if (!Object.keys(importedSave).includes("ownedUpgrades")) {
        importedSave.ownedUpgrades = [];
      }
      $save = importedSave;
    }
    saveGame(true);
    importPrompt = false;
  };

  setInterval(() => $save.settings.autoSave && saveGame(), 60 * 1000);
</script>

{#if importPrompt}
  <div class="overlay bg-black" transition:fade={{ duration: 500 }} />
  <div class="flex flex-col mx-auto max-w-sm px-2">
    <div class="flex flex-col mx-auto max-w-sm pr-4 z-50 fixed top-1/4 w-full ">
      <div
        class="rounded-md border-2 border-black bg-white"
        transition:fly={{ y: 200, duration: 500 }}
      >
        <div class="flex px-2 pt-2">
          <h1 class="text-5xl pr-2">📋</h1>
          <div class="flex flex-col">
            <h1 class="text-xl font-medium">Import Save</h1>
            <div class="flex justify-between items-baseline">
              <h1 class="pr-2">Enter your string below.</h1>
            </div>
          </div>
        </div>

        <p class="px-2 py-2 text-md">
          Paste your save string below to import your savegame.
        </p>
        <div class="flex justify-center mb-4">
          <textarea
            cols="30"
            rows="10"
            bind:value={importString}
            placeholder="eyJiYWxhbmNlIjoxM..."
            class="font-mono p-2 text-md overflow-scroll border-2 border-black"
          />
        </div>
        <div class="flex px-2 pb-2 justify-between select-none">
          <div
            on:click={() => {
              importPrompt = false;
            }}
            class="bg-red-400 w-1/2 mr-1 p-2 border-2 border-black flex flex-col justify-center align-middle rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
          >
            <h1 class="font-medium text-lg text-center">Cancel</h1>
          </div>
          <div
            on:click={importSave}
            class="bg-green-400 w-1/2 ml-1 p-2 border-2 border-black rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
          >
            <h1 class="font-medium text-lg text-center">Import Save</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if copied || saved || imported}
  <div in:fade class="bg-green-400 text-white sticky top-0 z-30">
    <div class="mx-auto max-w-sm px-2 font-mono font-bold text-center">
      {#if copied}
        <p>Save copied to clipboard!</p>
      {:else if saved}
        <p>Your game has been saved!</p>
      {:else if imported}
        <p>Save imported!</p>
      {/if}
    </div>
  </div>
{:else}
  <div in:fade class="bg-black text-white sticky top-0 z-50">
    <div class="flex justify-between mx-auto max-w-sm px-2 font-mono font-bold">
      <p on:click={() => saveGame()} class="cursor-pointer hover:underline">
        Save
      </p>
      <p on:click={exportSave} class="cursor-pointer hover:underline">Export</p>
      <p
        on:click={() => {
          importPrompt = true;
        }}
        class="cursor-pointer hover:underline"
      >
        Import
      </p>
      <p class="text-right">{formatSmall($save.balance)} HNS</p>
    </div>
  </div>
{/if}

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
