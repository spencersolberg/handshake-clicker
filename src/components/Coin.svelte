<script>
  import { save } from "../stores/save.js";
  import { formatSmall, getRate } from "../lib/functions.js";
  let div;

  const calculateClick = () => {
    let multiplier = 1;
    let base = 1;
    let bonus = 0;
    if ($save.ownedUpgrades.includes(0)) multiplier *= 2;
    if ($save.ownedUpgrades.includes(1)) multiplier *= 2;
    if ($save.ownedUpgrades.includes(2)) multiplier *= 2;
    if ($save.ownedUpgrades.includes(3)) multiplier *= 2;
    if ($save.ownedUpgrades.includes(4)) multiplier *= 2;
    if ($save.ownedUpgrades.includes(5)) bonus += getRate($save) * .01;
    if ($save.ownedUpgrades.includes(6)) bonus += getRate($save) * .01;
    if ($save.ownedUpgrades.includes(7)) bonus += getRate($save) * .01;
    if ($save.ownedUpgrades.includes(8)) bonus += getRate($save) * .01;
    if ($save.ownedUpgrades.includes(9)) bonus += getRate($save) * .01;
    return (base + bonus) * multiplier;
  }

  const click = (e) => {
    let click = calculateClick();

    $save.balance += click;
    $save.stats.hnsAllTime += click;
    $save.stats.hnsClicked += click;
    $save.stats.timesClicked++;

    spawnText(e, click);
  };

  const spawnText = (e, click) => {
    let t = document.createElement("p");
    t.style.left = e.pageX + "px";
    t.style.top = e.pageY - 20 + "px";
    t.className = "font-mono text-3xl text-green-400 absolute z-20 cursor-pointer";
    t.innerText = "+" + formatSmall(click);

    div.appendChild(t);
    let opacity = 100;
    let interval = setInterval(() => {
      t.style.opacity = String(opacity / 100);
      t.style.top = (Number(t.style.top.replace("px", "")) - 2) + "px";
      opacity--;
      if (opacity == 0) {
        t.remove();
        clearInterval(interval);
      }
    }, 20);
  };
</script>

<div class="select-none" bind:this={div} on:click={click} on:mousedown>
  <img
    src="hns.svg"
    id="coin"
    alt="HNS Icon"
    class="w-60 my-8 mx-auto transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
  />
</div>
