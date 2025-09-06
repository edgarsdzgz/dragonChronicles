<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';
  import { logger } from '$lib/logging/logger';

  let errorDetails: string = '';
  let isExporting = false;

  // Get error information from the page store
  $: error = $page.error;
  $: errorId = $page.error?.id || 'unknown';

  onMount(() => {
    // Generate detailed error information for debugging
    if (error) {
      errorDetails = JSON.stringify({
        message: error.message,
        stack: error.stack,
        id: error.id,
        timestamp: new Date().toISOString(),
        url: $page.url.toString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }, null, 2);
    }
  });

  // Export logs as NDJSON
  async function exportLogs() {
    if (isExporting) return;
    
    isExporting = true;
    try {
      // Use the existing logger's exportNDJSON method
      const blob = await logger.exportNDJSON();
      
      // Create and download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `draconia-logs-${new Date().toISOString().split('T')[0]}.ndjson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error('Failed to export logs:', exportError);
      alert('Failed to export logs. Check console for details.');
    } finally {
      isExporting = false;
    }
  }

  // Reload the page
  function reloadPage() {
    window.location.reload();
  }

  // Go back to home
  function goHome() {
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>Error - Draconia Chronicles</title>
</svelte:head>

<div class="error-container">
  <div class="error-content">
    <!-- Error Icon -->
    <div class="error-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </div>

    <!-- Error Message -->
    <h1 class="error-title">Something went wrong</h1>
    <p class="error-message">
      We encountered an unexpected error. Don't worry, your progress is safe.
    </p>

    <!-- Error ID for support -->
    {#if errorId !== 'unknown'}
      <div class="error-id">
        <small>Error ID: <code>{errorId}</code></small>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="error-actions">
      <button class="btn btn-primary" on:click={reloadPage}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23,4 23,10 17,10"/>
          <polyline points="1,20 1,14 7,14"/>
          <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
        </svg>
        Reload Page
      </button>

      <button class="btn btn-secondary" on:click={goHome}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3,9L12,2L21,9V20A2,2,0,0,1,19,22H5A2,2,0,0,1,3,20Z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        Go Home
      </button>

      <button class="btn btn-outline" on:click={exportLogs} disabled={isExporting}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21,15V19A2,2,0,0,1,19,21H5A2,2,0,0,1,3,19V15"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {isExporting ? 'Exporting...' : 'Download Logs'}
      </button>
    </div>

    <!-- Technical Details (Dev Only) -->
    {#if dev && errorDetails}
      <details class="error-details">
        <summary>Technical Details (Development)</summary>
        <pre class="error-stack">{errorDetails}</pre>
      </details>
    {/if}
  </div>
</div>

<style>
  .error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #ffffff;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .error-content {
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  .error-icon {
    color: #ff6b6b;
    margin-bottom: 24px;
  }

  .error-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #ffffff;
  }

  .error-message {
    font-size: 1.1rem;
    color: #b0b0b0;
    margin: 0 0 24px 0;
    line-height: 1.6;
  }

  .error-id {
    margin-bottom: 32px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-id code {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9rem;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    text-decoration: none;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #4f46e5;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .btn-outline {
    background: transparent;
    color: #b0b0b0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-outline:hover:not(:disabled) {
    color: white;
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }

  .error-details {
    text-align: left;
    margin-top: 32px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-details summary {
    padding: 16px;
    cursor: pointer;
    font-weight: 500;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error-details summary:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .error-stack {
    padding: 16px;
    margin: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0 0 8px 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85rem;
    line-height: 1.4;
    color: #e0e0e0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Responsive design */
  @media (min-width: 640px) {
    .error-actions {
      flex-direction: row;
      justify-content: center;
    }

    .btn {
      min-width: 140px;
    }
  }

  @media (max-width: 480px) {
    .error-title {
      font-size: 1.5rem;
    }

    .error-message {
      font-size: 1rem;
    }

    .error-content {
      padding: 0 16px;
    }
  }
</style>
