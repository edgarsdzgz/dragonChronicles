<script lang="ts">
  export let title: string = "Dragon Chronicles";
  
  function handleClick() {
    console.log(`Clicked: ${title}`);
  }
</script>

<button on:click={handleClick}>
  {title}
</button>