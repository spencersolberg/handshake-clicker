<script>
  import { browser } from "$app/env";
  import { save } from "../stores/save.js";
  import { buildings } from "../lib/buildings";
  import { upgrades } from "../lib/upgrades";
  import { format, getRate, dateString, checkEligibility } from "../lib/functions.js";
  import TopBar from "../components/TopBar.svelte";
  import Coin from "../components/Coin.svelte";
  import Building from "../components/Building.svelte";
  import Upgrade from "../components/Upgrade.svelte";
  import { Howl } from "howler";
  import { onMount } from "svelte";
  import { tlds } from "../lib/icann.js";
  import { settings } from "party-js";
  import { fade, fly } from "svelte/transition";

  const sounds = {
    pop: new Howl({ src: "/pop.wav" }),
    pop2: new Howl({ src: "/pop2.wav" }),
    chaching: new Howl({ src: "/chaching.wav" }),
    achievement: new Howl({ src: "/achievement.wav" }),
  };

  let rate = 0;
  let realRate = 0;
  let glitched = false;
  let glitchedCount = 0;
  let lastBalance = 0;
  let lastUpdate = new Date();
  let deletePrompt = false;
  let availableUpgrades = [];

  if (browser && !localStorage.getItem("save")) {
    let newSave = {
      balance: Number(0),
      ownedBuildings: {},
      settings: {
        audio: true,
        walletName: "Namer",
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

    let string = JSON.stringify(newSave);

    localStorage.setItem("save", string);
  }
  $: {
    rate = getRate($save);
    $save.balance = Number($save.balance.toFixed(4));
    $save.stats.hnsAllTime = Number($save.stats.hnsAllTime.toFixed(4));
    availableUpgrades = checkEligibility($save, upgrades);
  }

  const tenMilliseconds = () => {
    let now = new Date();
    let elapsed = now.getTime() - lastUpdate.getTime();
    $save.balance += (rate / 1000) * elapsed;
    $save.stats.hnsAllTime += (rate / 1000) * elapsed;
    lastUpdate = now;
  };

  const load = () => {
    if (!browser) return;
    let string = localStorage.getItem("save");
    console.log("loading save from local storage...");
    if (!string.includes("{")) {
      let oldSave = JSON.parse(atob(string));
      $save = {
        balance: Number(oldSave.balance),
        ownedBuildings: oldSave.ownedBuildings,
        ownedUpgrades: [],
        settings: {
          audio: oldSave.audio,
          walletName: oldSave.walletName,
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
      let obj = JSON.parse(string);
      if (!Object.keys(obj).includes("ownedUpgrades")) {
        obj.ownedUpgrades = [];
      }
      $save = obj;
    }
  };

  // const serializeSave = () => {
  //   let data = {
  //     balance: Number(balance.toFixed(2)),
  //     clickMultiplier,
  //     perSecond,
  //     rateMultiplier,
  //     ownedBuildings,
  //     audio,
  //     walletName
  //   };

  //   let base64 = btoa(JSON.stringify(data));

  //   return base64;
  // };

  const downloadSave = () => {
    let string = JSON.stringify($save);
    let base64 = btoa(string);

    let a = document.createElement("a");
    a.download = "handshake-incremental-game-save.txt";

    let t = new Blob([base64], {
      type: "text/plain",
    });

    a.href = window.URL.createObjectURL(t);
    a.click();
  };

  const deleteSave = () => {
    if (!browser) return;
    localStorage.removeItem("save");
    location.reload();
  };

  setInterval(tenMilliseconds, 10);
  setInterval(() => {
    realRate = $save.balance - lastBalance;
    if (realRate / rate > 1.2) {
      glitchedCount++;
    } else {
      glitchedCount = 0;
    }

    if (glitchedCount > 10) glitched = true;

    lastBalance = $save.balance;
  }, 1000);

  let obj = load();

  let icann = false;
  // let tld;
  // if (browser) {
    // let subs = location.host.split(".");
    // tld = subs[subs.length - 1];
    // console.log(tld);
    // icann = tlds.includes(tld.toUpperCase());
  // }
</script>

<svelte:head>
  <title>Handshake Clicker</title>
</svelte:head>

{#if icann}
  <h1 class="mt-8 text-center mx-auto font-black text-5xl max-w-sm">
    This site is only available for Handshake visitors.
  </h1>
  <h2 class="text-center font-medium text-2xl mx-auto max-w-sm mt-4">
    Please visit <a
      class="underline text-blue-500 hover:text-purple-600"
      href="https://handshake.incrementalgame">handshake.incrementalgame</a
    >
    using
    <a
      class="underline text-blue-500 hover:text-purple-600"
      href="https://impervious.com/fingertip">Fingertip</a
    >,
    <a
      class="underline text-blue-500 hover:text-purple-600"
      href="https://impervious.com/beacon">Beacon</a
    > or other Handshake-resolving software.
  </h2>
{:else}
  <TopBar />
  <div class="flex flex-col mx-auto max-w-sm p-2 bg-white">
    {#if deletePrompt}
      <div class="overlay bg-black" transition:fade={{ duration: 500 }} />
      <div
        class="flex flex-col mx-auto max-w-sm pr-4 z-50 fixed top-1/4 w-full "
      >
        <div
          class="rounded-md border-2 border-black bg-red-400"
          transition:fly={{ y: 200, duration: 500 }}
        >
          <div class="flex px-2 pt-2">
            <h1 class="text-5xl pr-2">🗑</h1>
            <div class="flex flex-col">
              <h1 class="text-xl font-medium">Delete Save</h1>
              <div class="flex justify-between items-baseline">
                <h1 class="pr-2">You will lose all of your progress!</h1>
              </div>
            </div>
          </div>

          <p class="px-2 py-2 text-md">
            Are you sure you want to delete your save? This will reset all of
            your progress!
          </p>
          <div class="flex px-2 pb-2 justify-between select-none">
            <div
              on:click={() => {
                deletePrompt = false;
              }}
              class="bg-green-400 w-1/2 mr-1 p-2 border-2 border-black flex flex-col justify-center align-middle rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
            >
              <h1 class="font-medium text-lg text-center">Cancel</h1>
            </div>
            <div
              on:click={deleteSave}
              class="bg-red-600 w-1/2 ml-1 p-2 border-2 border-black rounded-md transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
            >
              <h1 class="font-medium text-lg text-center">Delete Save</h1>
            </div>
          </div>
        </div>
      </div>
    {/if}
    <h1 class="text-5xl text-center font-black mx-auto mt-8">
      <span
        spellcheck="false"
        autocorrect="off"
        contenteditable
        bind:textContent={$save.settings.walletName}
      />'s Wallet
    </h1>
    <h1 class="text-4xl mx-auto mt-4 font-bold font-mono text-center">
      {format($save.balance)} HNS
    </h1>
    <h2 class="text-xl mx-auto mt-2 font-mono">
      {format(rate)} HNS/s
    </h2>
    {#if $save.settings.debug}
      <h2 class="text-sm mx-auto mt-2 font-mono">
        Actual: {format(realRate)} HNS/s
      </h2>
    {/if}
    {#if glitched && $save.settings.debug}
      <h2
        on:click={() => browser && location.reload()}
        class="text-sm mx-auto mt-2 font-mono cursor-pointer text-blue-500 hover:text-purple-600 hover:underline"
      >
        Refresh...
      </h2>
    {/if}

    <Coin
      on:mousedown={() =>
        $save.settings.audio &&
        sounds.pop
          // @ts-ignore
          .play()}
    />

    {#if $save.settings.debug}
      <h1 class="text-5xl mb-2 font-black">Debug</h1>
      <pre
        class="font-mono mx-auto overflow-x-scroll max-w-sm bg-gray-800 rounded-md text-white p-2">{JSON.stringify(
          $save,
          undefined,
          4
        )}</pre>
    {/if}

    <h1 class="text-5xl mb-2 font-black">Shop</h1>
    <h2 class="text-3xl mb-2 font-bold">Buildings</h2>
    {#each buildings as building}
      {#if building.id == 0 || $save.ownedBuildings[building.id - 1] || $save.ownedBuildings[building.id - 1] === 0}
        <Building
          {building}
          on:buy={() =>
            $save.settings.audio &&
            sounds.chaching
              // @ts-ignore
              .play()}
          on:sell={() =>
            $save.settings.audio &&
            sounds.pop2
              // @ts-ignore
              .play()}
        />
      {/if}
    {/each}
    <h2 class="text-3xl mb-2 font-bold">Upgrades</h2>
    {#if availableUpgrades.length >= 1}
    <div class="grid grid-cols-6 max-w-sm mx-auto">
      {#each availableUpgrades.sort((a, b) => a.price - b.price) as upgrade}
        <Upgrade
          {upgrade}
          on:purchase={() =>
            $save.settings.audio &&
            sounds.chaching
              // @ts-ignore
              .play()}
        />
      {/each}
    </div>
    {:else}
    <p class="mb-2 text-lg">No upgrades available for purchase.</p>
    <p class="mb-2 text-lg">Check back later!</p>
    {/if}
    <h1 class="text-5xl font-black mb-4">Stats</h1>
    <ul class="mb-2">
      <li class="text-lg">
        HNS Generated (All-Time): <span class="font-mono"
          >{format($save.stats.hnsAllTime)} HNS</span
        >
      </li>
      <li class="text-lg">
        Coin Clicks: <span class="font-mono"
          >{format($save.stats.timesClicked, 0)}</span
        >
      </li>
      <li class="text-lg">
        HNS Clicked: <span class="font-mono"
          >{format($save.stats.hnsClicked, 0)} HNS</span
        >
      </li>
      <li class="text-lg">
        Buildings Discovered: <span class="font-mono">
          {Object.keys($save.ownedBuildings).length ==
          Object.keys(buildings).length
            ? Object.keys($save.ownedBuildings).length
            : Object.keys($save.ownedBuildings).length + 1}/{Object.keys(
            buildings
          ).length}
        </span>
      </li>
      <li class="text-lg">
        Buildings Purchased: <span class="font-mono"
          >{format($save.stats.buildingsPurchased, 0)}</span
        >
      </li>
      <li class="text-lg">
        Buildings Sold: <span class="font-mono"
          >{format($save.stats.buildingsSold, 0)}</span
        >
      </li>
      <li class="text-lg">
        Run Started: <span class="font-mono"
          >{dateString($save.stats.runStarted)}</span
        >
      </li>
      <li class="text-lg">
        Last Saved: <span class="font-mono">{dateString($save.lastSave)}</span>
      </li>
    </ul>
    <h1 class="text-5xl font-black mb-4">Settings</h1>
    <div class="flex-col mb-2 items-base">
      <p class="text-lg font-mono pr-2">Your Name:</p>
      <p
        class="border-2 text-lg border-black rounded-md p-1 overflow-x-scroll max-w-sm"
        contenteditable
        bind:textContent={$save.settings.walletName}
      />
    </div>
    <div class="flex mb-2 items-baseline">
      <input
        class="pr-1"
        type="checkbox"
        name="AutoSave"
        id="autosave"
        bind:checked={$save.settings.autoSave}
      />
      <label class="text-lg font-mono pl-2" for="audio">AutoSave</label>
    </div>
    <div class="flex mb-2 items-baseline">
      <input
        class="pr-1"
        type="checkbox"
        name="Audio"
        id="audio"
        bind:checked={$save.settings.audio}
      />
      <label class="text-lg font-mono pl-2" for="audio">Sound</label>
    </div>
    <div class="flex mb-2 items-baseline">
      <input
        class="pr-1"
        type="checkbox"
        name="Debug"
        id="debug"
        bind:checked={$save.settings.debug}
      />
      <label class="text-lg font-mono pl-2" for="audio">Debug Mode</label>
    </div>

    <p
      on:click={downloadSave}
      class="text-xl mb-2 cursor-pointer hover:text-purple-600 text-blue-500 hover:underline"
    >
      Download Save
    </p>
    <p
      on:click={() => {
        deletePrompt = true;
      }}
      class="text-xl mb-2 cursor-pointer hover:text-red-600 text-red-400 hover:underline"
    >
      Delete Save
    </p>

    <h1 class="text-5xl font-black mb-2">Tip</h1>
    <img src="/qr.svg" alt="" />
    <p class="text-xs font-mono text-center mb-2">
      hs1qjs9e244ur25u0kvc362kjgegvlfcpt90a6z5d8
    </p>
    <a
      target="_blank"
      class="text-lg font-mono text-center underline text-blue-500 hover:text-purple-600"
      href="https://spencersolberg">spencersolberg/</a
    >
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
