<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // This page should never render because the load function throws an error
  // But we'll include a fallback just in case
  onMount(() => {
    // If somehow this component renders, redirect to home after a short delay
    setTimeout(() => {
      goto('/');
    }, 2000);
  });
</script>

<svelte:head>
  <title>Test Error - Draconia Chronicles</title>
</svelte:head>

<div class="boom-container">
  <div class="boom-content">
    <h1>💥 Boom!</h1>
    <p>This page intentionally triggers an error to test the error boundary.</p>
    <p>You should be redirected to the error page...</p>
    <p><small>If you see this message, something went wrong with the error handling.</small></p>
  </div>
</div>

<style>
  .boom-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .boom-content {
    text-align: center;
    max-width: 400px;
    padding: 20px;
  }

  .boom-content h1 {
    font-size: 3rem;
    margin: 0 0 16px 0;
  }

  .boom-content p {
    margin: 0 0 12px 0;
    line-height: 1.6;
  }

  .boom-content small {
    opacity: 0.8;
  }
</style>
