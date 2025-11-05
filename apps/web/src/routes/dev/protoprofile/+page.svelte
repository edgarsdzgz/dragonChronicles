<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application } from 'pixi.js';
  import { ProfileSelectionManager } from '$lib/pixi/systems/profile-selection-manager';
  import { ProfileNameEntryManager } from '$lib/pixi/systems/profile-name-entry';
  import { ResponsiveManager } from '$lib/pixi/systems/responsive-manager';

  let canvas: HTMLCanvasElement;
  let app: Application;
  let profileSelectionManager: ProfileSelectionManager;
  let profileNameEntryManager: ProfileNameEntryManager;
  let responsiveManager: ResponsiveManager;
  let currentSlot: 1 | 2 | 3 = 1;
  let statusMessage = 'Profile Selection Test Page';
  let showingNameEntry = false;

  // Initialize PixiJS application
  async function initializeApp() {
    try {
      console.log('🎯 Profile Test: Starting initialization...');
      
      app = new Application();
      await app.init({
        view: canvas,
        background: 0x0d4f3c, // Draconia dark green background
        resizeTo: canvas.parentElement ?? window,
      });

      console.log('🎯 Profile Test: PixiJS app initialized');

      // Initialize responsive manager
      responsiveManager = new ResponsiveManager(app);
      console.log('🎯 Profile Test: ResponsiveManager initialized');

      // Initialize profile selection manager
      profileSelectionManager = new ProfileSelectionManager(app, responsiveManager, {
        onProfileSelected: (profileId: string, slotNumber: number) => {
          statusMessage = `✅ Profile loaded: ${profileId} in slot ${slotNumber}`;
          console.log('🎯 Profile Test: Profile selected:', { profileId, slotNumber });
        },
        onNewProfile: (slotNumber: number) => {
          console.log('🎯 Profile Test: New profile requested for slot', slotNumber);
          showNameEntry(slotNumber as 1 | 2 | 3);
        },
        onCopy: () => {
          statusMessage = '📋 Copy profile (not implemented)';
          console.log('🎯 Profile Test: Copy profile requested');
        },
        onErase: () => {
          statusMessage = '🗑️ Erase profile (not implemented)';
          console.log('🎯 Profile Test: Erase profile requested');
        },
        onOptions: () => {
          statusMessage = '⚙️ Options (not implemented)';
          console.log('🎯 Profile Test: Options requested');
        },
        onCancel: () => {
          statusMessage = '❌ Cancel (not implemented)';
          console.log('🎯 Profile Test: Cancel requested');
        },
        onTestJourney: () => {
          statusMessage = '🧪 Test Journey (not implemented)';
          console.log('🎯 Profile Test: Test Journey requested');
        },
      });

      console.log('🎯 Profile Test: ProfileSelectionManager created');

      // Initialize profile name entry manager (for when we select empty slots)
      profileNameEntryManager = new ProfileNameEntryManager(app, responsiveManager, {
        onNameConfirmed: (name: string, slotNumber: number) => {
          statusMessage = `✅ Profile created: "${name}" in slot ${slotNumber}`;
          console.log('🎯 Profile Test: Profile confirmed:', { name, slotNumber });
          // Go back to profile selection
          hideNameEntry();
        },
        onCancel: () => {
          statusMessage = '❌ Profile creation cancelled';
          console.log('🎯 Profile Test: Profile creation cancelled');
          // Go back to profile selection
          hideNameEntry();
        },
      });

      console.log('🎯 Profile Test: ProfileNameEntryManager created');

      // Show the profile selection screen
      await profileSelectionManager.show();
      statusMessage = 'Profile Selection active';
      console.log('🎯 Profile Test: Profile selection shown');

    } catch (error) {
      console.error('🎯 Profile Test: Failed to initialize app:', error);
      statusMessage = '❌ Failed to initialize application';
    }
  }

  // Show name entry for a specific slot
  async function showNameEntry(slotNumber: 1 | 2 | 3) {
    console.log('🎯 Profile Test: Showing name entry for slot', slotNumber);
    currentSlot = slotNumber;
    showingNameEntry = true;
    
    // Hide profile selection
    profileSelectionManager.hide();
    
    // Show name entry
    await profileNameEntryManager.show(slotNumber);
    statusMessage = `Profile Name Entry active for slot ${slotNumber}`;
  }

  // Hide name entry and return to profile selection
  function hideNameEntry() {
    console.log('🎯 Profile Test: Hiding name entry, returning to profile selection');
    showingNameEntry = false;
    
    // Hide name entry
    profileNameEntryManager.hide();
    
    // Show profile selection
    profileSelectionManager.show();
    statusMessage = 'Profile Selection active';
  }

  // Reset everything
  async function resetAll() {
    console.log('🎯 Profile Test: Resetting everything');
    if (showingNameEntry) {
      hideNameEntry();
    } else {
      profileSelectionManager.hide();
      await profileSelectionManager.show();
      statusMessage = 'Profile Selection reset';
    }
  }

  // Animation loop for both managers
  let animationId: number;
  
  function updateLoop() {
    if (profileSelectionManager) {
      profileSelectionManager.update(16); // ~60fps
    }
    if (profileNameEntryManager) {
      profileNameEntryManager.update(16); // ~60fps
    }
    animationId = requestAnimationFrame(updateLoop);
  }

  onMount(() => {
    console.log('🎯 Profile Test: Component mounted, initializing...');
    initializeApp();
    
    // Start animation loop
    animationId = requestAnimationFrame(updateLoop);
  });

  onDestroy(() => {
    console.log('🎯 Profile Test: Component destroyed, cleaning up...');
    
    // Stop animation loop
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    if (profileSelectionManager) {
      profileSelectionManager.destroy();
    }
    if (profileNameEntryManager) {
      profileNameEntryManager.destroy();
    }
    if (app) {
      app.destroy(true, { children: true });
    }
  });
</script>

<svelte:head>
  <title>Profile Name Entry Test - Draconia Chronicles</title>
</svelte:head>

<div class="test-container">
  <!-- PixiJS Canvas -->
  <canvas bind:this={canvas} class="pixi-canvas"></canvas>

  <!-- Control Panel -->
  <div class="control-panel">
    <div class="panel-header">
      <h2>Profile Selection Test</h2>
      <p class="status">{statusMessage}</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <h3>Current Screen</h3>
        <div class="screen-info">
          {#if showingNameEntry}
            <span class="screen-indicator name-entry">Name Entry (Slot {currentSlot})</span>
          {:else}
            <span class="screen-indicator profile-selection">Profile Selection</span>
          {/if}
        </div>
      </div>

      <div class="control-group">
        <h3>Actions</h3>
        <button class="action-btn" on:click={resetAll}>
          {showingNameEntry ? 'Back to Profile Selection' : 'Reset Profile Selection'}
        </button>
      </div>

      <div class="control-group">
        <h3>Instructions</h3>
        <ul class="instructions">
          {#if showingNameEntry}
            <li>Type a dragon name (letters only, 3-20 characters)</li>
            <li>Press ENTER or click Confirm to create profile</li>
            <li>Press ESC or click Cancel to go back</li>
            <li>Notice the gem-colored Confirm button (Gold/Ruby/Sapphire)</li>
          {:else}
            <li>Use arrow keys or click to navigate between profile slots</li>
            <li>Press ENTER or click to select a slot</li>
            <li>Empty slots will open the name entry screen</li>
            <li>Filled slots will load existing profiles</li>
          {/if}
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .test-container {
    position: fixed;
    inset: 0;
    display: flex;
    background: #0d4f3c;
    font-family: 'Cinzel', serif;
  }

  .pixi-canvas {
    flex: 1;
    width: 100%;
    height: 100%;
    display: block;
  }

  .control-panel {
    width: 300px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    overflow-y: auto;
    border-left: 2px solid #7fb892;
  }

  .panel-header h2 {
    margin: 0 0 10px 0;
    color: #ffd700;
    font-size: 1.5rem;
  }

  .status {
    margin: 0 0 20px 0;
    padding: 10px;
    background: rgba(127, 184, 146, 0.2);
    border-radius: 4px;
    font-size: 0.9rem;
    border-left: 3px solid #7fb892;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .control-group h3 {
    margin: 0 0 10px 0;
    color: #7fb892;
    font-size: 1.1rem;
  }

  .screen-info {
    margin-bottom: 12px;
  }

  .screen-indicator {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .screen-indicator.profile-selection {
    background: #0066cc;
    color: #fff;
  }

  .screen-indicator.name-entry {
    background: #cc6600;
    color: #fff;
  }


  .action-btn {
    padding: 10px 16px;
    background: #ffd700;
    color: #0d4f3c;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: #ffa500;
    transform: translateY(-1px);
  }

  .instructions {
    margin: 0;
    padding-left: 20px;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .instructions li {
    margin-bottom: 6px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .test-container {
      flex-direction: column;
    }

    .control-panel {
      width: 100%;
      height: 200px;
      border-left: none;
      border-top: 2px solid #7fb892;
    }

  }
</style>
