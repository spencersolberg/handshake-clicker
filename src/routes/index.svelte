<script>
  import { browser } from "$app/env";

  let balance = 0;
  let clickMultiplier = 1;
  let perSecond = 0;
  let rateMultiplier = 1;
  let ownedBuildings = {};
  let audio = true;
  let walletName = "Namer"

  const buildings = [
    {
      id: 0,
      name: "ASIC Miner",
      emoji: "⛏",
      desc: "Cheap ASIC Mining computer to mine on the Handshake Blockchain.",
      basePrice: 75,
      rate: 0.5,
    },
    {
      id: 1,
      name: "TLD Staking",
      emoji: "🏷",
      desc: "You stake one of your TLDs to allow SLD registrations. Nice!",
      basePrice: 500,
      rate: 5,
    },
    {
      id: 2,
      name: "Sniping Bot",
      emoji: "🤖",
      desc: "An bot programmed to automatically mint rare or expiring Handshake names.",
      basePrice: 5500,
      rate: 40,
    },
    {
      id: 3,
      name: "ICANN Proxy",
      emoji: "✈️",
      desc: "A proxy website to access Handshake sites through an ICANN domain.",
      basePrice: 60000,
      rate: 235,
    },
    {
      id: 4,
      name: "Nameserver",
      emoji: "🔌",
      desc: "An authoritative, public nameserver for setting DNS records for Handshake names.",
      basePrice: 650000,
      rate: 1300,
    },
    {
      id: 5,
      name: "Name Marketplace",
      emoji: "🛍",
      desc: "Online service for users to sell and purchase Handshake names.",
      basePrice: 7000000,
      rate: 7000,
    },
    {
      id: 6,
      name: "Registar",
      emoji: "📒",
      desc: "Your own Handshake name registrar to lease SLDs to users.",
      basePrice: 100000000,
      rate: 39000,
    },
    {
      id: 7,
      name: "HNS Exchange",
      emoji: "🏦",
      desc: "Online platform for exchanging HNS and other currencies.",
      basePrice: 1650000000,
      rate: 220000,
    },
  ];

  const click = () => {
    balance += 1 * clickMultiplier;
  };

  const clickDown = () => {
    audio && new Audio("/pop.wav").play();
  };

  const millisecond = () => {
    balance += perSecond * rateMultiplier * 0.001;
  };

  const buy = (building) => {
    let price =
      building.basePrice * Math.pow(1.15, ownedBuildings[building.id] ?? 0);

    if (balance < price) return;

    balance -= price;

    if (!ownedBuildings[building.id]) {
      ownedBuildings[building.id] = 1;
    } else {
      ownedBuildings[building.id] += 1;
    }

    perSecond += building.rate;
    audio && new Audio("/chaching.wav").play();
  };

  const sell = (building) => {
    if (!ownedBuildings[building.id]) return;

    let refund =
      (building.basePrice * Math.pow(1.15, ownedBuildings[building.id] ?? 0)) /
      4;

    balance += refund;

    ownedBuildings[building.id] -= 1;

    perSecond -= building.rate;

    audio && new Audio("/pop2.wav").play();
  };

  const format = (number) => {
    if (number < 1000000) {
      return number.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // what tier? (determines SI symbol)
    let suffixes = [
      "",
      "k",
      " million",
      " billion",
      " trillion",
      " quadrillion",
      " quintillion",
    ];

    let tier = (Math.log10(Math.abs(number)) / 3) | 0;

    // if zero, we don't need a suffix
    if (tier == 0) return number;

    // get suffix and determine scale
    let suffix = suffixes[tier];
    let scale = Math.pow(10, tier * 3);

    // scale the number
    let scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(3) + suffix;
  };

  const formatSmall = (number) => {
    if (number < 1000) {
      return number.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // what tier? (determines SI symbol)

    let suffixes = ["", "K", "M", "B", "t", "q", "Q"];

    let tier = (Math.log10(Math.abs(number)) / 3) | 0;

    // if zero, we don't need a suffix
    if (tier == 0) return number;

    // get suffix and determine scale
    let suffix = suffixes[tier];
    let scale = Math.pow(10, tier * 3);

    // scale the number
    let scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(2) + suffix;
  };

  const serializeSave = () => {
    let data = {
      balance: Number(balance.toFixed(2)),
      clickMultiplier,
      perSecond,
      rateMultiplier,
      ownedBuildings,
      audio,
      walletName
    };

    let base64 = btoa(JSON.stringify(data));

    return base64;
  };

  const exportSave = () => {
    let save = serializeSave();

    let c = document.createElement("a");
    c.download = "handshake-incremental-game-save.txt";

    let t = new Blob([save], {
      type: "text/plain",
    });

    c.href = window.URL.createObjectURL(t);
    c.click();
  };

  const loadSave = (saveString) => {
    let save = JSON.parse(atob(saveString));
    balance = save.balance;
    clickMultiplier = save.clickMultiplier;
    perSecond = save.perSecond;
    rateMultiplier = save.rateMultiplier;
    ownedBuildings = save.ownedBuildings;
    audio = save.audio ?? true;
    walletName = save.walletName ?? "Namer";
  };

  const importSave = () => {
    if (!browser) return;
    let saveString = window.prompt("Paste your save string");
    loadSave(saveString);
  };

  const save = () => {
    if (!browser) return;
    localStorage.setItem("save", serializeSave());
  };

  const load = () => {
    if (!browser) return;
    let saveString = localStorage.getItem("save");
    if (saveString) loadSave(saveString);
  };

  const deleteSave = () => {
    if (!browser) return;
    if (window.confirm("Are you sure you want to delete your save? You will lose all of your progress!")) {
      localStorage.removeItem("save");
      location.reload();
    }
    
  }

  setInterval(millisecond, 1);
  setInterval(save, 60 * 1000);

  load();

  let icann;

  const checkIcann = async () => {
    if (!browser) return false;

    const res = await fetch("/icann.txt");
    const txt = await res.text();
    const tlds = txt.toLowerCase();
    const len = tlds.length;

    const subs = location.host.split(".");
    const tld = subs[subs.length -1];
    return tlds.includes(tld);
  }

  checkIcann().then((r) => icann = r);
</script>

<svelte:head>
  <title>Handshake Clicker</title>
</svelte:head>

{#if icann}
<h1 class="mt-8 text-center mx-auto font-black text-5xl max-w-sm">This site is only available for Handshake visitors.</h1>
<h2 class="text-center font-medium text-3xl mx-auto max-w-sm mt-4">Please visit <a class="underline text-blue-500 hover:text-purple-600" href="https://handshake.incrementalgame">handshake.incrementalgame</a> using <a class="underline text-blue-500 hover:text-purple-600" href="https://impervious.com/fingertip">Fingertip</a>, <a class="underline text-blue-500 hover:text-purple-600" href="https://impervious.com/beacon">Beacon</a> or other Handshake-resolving software.</h2>
{:else}
<div class="bg-black text-white sticky top-0 z-50">
  <div class="flex justify-between mx-auto max-w-sm px-2 font-mono font-bold">
    <p on:click={save} class="cursor-pointer hover:underline">Save</p>
    <p on:click={exportSave} class="cursor-pointer hover:underline">Export</p>
    <p on:click={importSave} class="cursor-pointer hover:underline">Import</p>
    <p class="text-right">{formatSmall(balance)} HNS</p>
  </div>
</div>
<div class="flex flex-col mx-auto max-w-sm p-2 bg-white">
  <h1 class="text-5xl text-center font-black mx-auto mt-8"><span spellcheck="false" autocorrect="off" contenteditable bind:textContent={walletName}></span>'s Wallet</h1>
  <h1 class="text-4xl mx-auto mt-4 font-bold font-mono text-center">
    {format(balance)} HNS
  </h1>
  <h2 class="text-xl mx-auto mt-2 font-mono">
    {format(perSecond)} HNS/s
  </h2>
  <!-- <h2>{icann}</h2> -->

  <div on:click={click} on:mousedown={clickDown}>
    <img
      src="hns.svg"
      alt="HNS Icon"
      class="w-60 my-8 mx-auto transition-transform transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
    />
  </div>

  <!-- {JSON.stringify(ownedBuildings)} -->
  <!-- {serializeSave()} -->
  <!-- <h1 on:click={exportSave}>Export Save</h1> -->
  <!-- <h1 on:click={importSave}>Import Save</h1> -->

  <h1 class="text-5xl mb-2 font-black">Shop</h1>
  <h2 class="text-3xl mb-2 font-bold">Buildings</h2>
  {#each buildings as building}
    {#if building.id == 0 || ownedBuildings[building.id - 1] || ownedBuildings[building.id - 1] === 0}
      <div class="border-2 border-black rounded-md mb-4">
        <div class="flex px-2 pt-2">
          <h1 class="text-5xl pr-2">{building.emoji}</h1>
          <div class="flex flex-col">
            <h1 class="text-xl font-medium">{building.name}</h1>
            <div class="flex justify-between items-baseline">
              <h1 class="text-gray-500 pr-2">
                Rate: <span class="font-mono"
                  >{format(building.rate)} HNS/s</span
                >,
              </h1>
              <h1 class="text-gray-500">
                Owned: <span class="font-mono"
                  >{(ownedBuildings[building.id] ?? 0).toLocaleString()}</span
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
            class="bg-green-400 w-1/2 mr-1 p-2 border-2 border-black rounded-md transition-transform transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
          >
            <h1 class="font-medium text-lg">Buy</h1>
            <h1 class="font-mono">
              {format(
                building.basePrice *
                  Math.pow(1.15, ownedBuildings[building.id] ?? 0)
              )} HNS
            </h1>
          </div>

          <div
            on:click={() => {
              sell(building);
            }}
            class="bg-red-400 w-1/2 ml-1 p-2 border-2 border-black rounded-md transition-transform transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
          >
            <h1 class="font-medium text-lg">Sell</h1>
            <h1 class="font-mono">
              {ownedBuildings[building.id]
                ? format(
                    (building.basePrice *
                      Math.pow(1.15, ownedBuildings[building.id] ?? 0)) /
                      4
                  ) + " HNS"
                : "N/A"}
            </h1>
          </div>
        </div>
      </div>
    {/if}
  {/each}
  <!-- <h2 class="text-3xl mb-2">Upgrades</h2> -->
  <h1 class="text-5xl font-black mb-2">Settings</h1>
  <div class="flex mx-auto mb-2 items-baseline">
    <input class="pr-1" type="checkbox" name="Audio" id="audio" bind:checked={audio} />
    <label class="text-lg font-mono pl-2" for="audio">Audio</label>
  </div>
  <p on:click={deleteSave} class=" text-lg text-center mb-2 cursor-pointer hover:text-red-600 text-red-400 hover:underline">Delete Save</p>

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