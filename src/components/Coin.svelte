<script>
  import { save } from "../stores/save.js";

  const click = () => {
    $save.balance++;
    $save.stats.hnsAllTime ++;
    $save.stats.hnsClicked ++;
    $save.stats.timesClicked ++;
  };
</script>

<div on:click={click} on:mousedown>
  <img
    src="hns.svg"
    id="coin"
    alt="HNS Icon"
    class="w-60 my-8 mx-auto transition-transform transform-gpu motion-safe:hover:scale-105 motion-safe:active:scale-95 cursor-pointer"
  />
</div>
