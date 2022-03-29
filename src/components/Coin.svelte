<script>
  import { save } from "../stores/save.js";
  import { formatSmall } from "../lib/functions.js";
  let div;

  const calculateClick = () => {
    return 1;
  }

  const click = (e) => {
    let click = calculateClick();

    $save.balance++;
    $save.stats.hnsAllTime++;
    $save.stats.hnsClicked++;
    $save.stats.timesClicked++;

    spawnText(e, click);
  };

  const spawnText = (e, click) => {
    let t = document.createElement("p");
    t.style.left = e.clientX + "px";
    t.style.top = e.clientY - 20 + "px";
    t.className = "font-mono text-3xl text-green-400 fixed z-50";
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
