<script lang="ts">
  // Should fail ESLint: explicit any type
  export let data: any = 'bad';
</script>

{data}
