<script>
  import { save } from "../stores/save.js";
  import { formatSmall } from "../lib/functions.js";
  import { browser } from "$app/env";
  import { fade } from "svelte/transition";

  let saved = false;
  let copied = false;
  let imported = false;

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
    let base64 = window.prompt("Paste your save string");
    let string = atob(base64);
    let importedSave = JSON.parse(string);
    if (Object.keys(importedSave).includes("clickMultiplier")) {
      $save = {
        balance: Number(importedSave.balance),
        ownedBuildings: importedSave.ownedBuildings,
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
      $save = importedSave;
    };
    saveGame(true);
  };

  setInterval(() => $save.settings.autoSave && saveGame(), 60 * 1000);
</script>

{#if copied || saved || imported}
  <div in:fade class="bg-green-400 text-white sticky top-0 z-50">
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
      <p on:click={importSave} class="cursor-pointer hover:underline">Import</p>
      <p class="text-right">{formatSmall($save.balance)} HNS</p>
    </div>
  </div>
{/if}
