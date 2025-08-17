<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    returnToDraconia: void;
  }>();
  
  export let show = false;
  
  function handleReturnToDraconia() {
    dispatch('returnToDraconia');
  }
</script>

{#if show}
  <!-- Overlay -->
  <div class="dialog-overlay">
    <!-- YOU WIN Dialog per spec §8 -->
    <div class="you-win-dialog">
      <!-- Victory Header -->
      <div class="victory-header">
        <div class="victory-title">🎉 YOU WIN! 🎉</div>
        <div class="victory-subtitle">Land 10 Boss Defeated!</div>
      </div>
      
      <!-- Victory Content -->
      <div class="victory-content">
        <p class="victory-message">
          Congratulations! You have successfully defeated the mighty Land 10 boss 
          and conquered the Verdant Dragonplains!
        </p>
        
        <div class="victory-stats">
          <div class="stat-item">
            <span class="stat-label">Journey Complete</span>
            <span class="stat-value">Land 10 Cleared</span>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="victory-actions">
        <button 
          class="return-btn"
          on:click={handleReturnToDraconia}
        >
          Return to Draconia
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* YOU WIN Dialog per spec §8 - Custom themed dialog */
  
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .you-win-dialog {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 2px solid #ffd700;
    border-radius: 16px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 215, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: victoryEnter 0.6s ease-out;
  }
  
  @keyframes victoryEnter {
    0% {
      transform: scale(0.8) translateY(20px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  
  .victory-header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .victory-title {
    font-size: 32px;
    font-weight: 700;
    color: #ffd700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 8px;
    animation: titleGlow 2s ease-in-out infinite alternate;
  }
  
  @keyframes titleGlow {
    0% {
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.4);
    }
    100% {
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.7);
    }
  }
  
  .victory-subtitle {
    font-size: 18px;
    font-weight: 500;
    color: #e2e8f0;
    opacity: 0.9;
  }
  
  .victory-content {
    margin-bottom: 32px;
  }
  
  .victory-message {
    color: #cbd5e0;
    font-size: 16px;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .victory-stats {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid rgba(255, 215, 0, 0.2);
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-label {
    color: #a0aec0;
    font-size: 14px;
  }
  
  .stat-value {
    color: #ffd700;
    font-weight: 600;
    font-size: 16px;
  }
  
  .victory-actions {
    display: flex;
    justify-content: center;
  }
  
  .return-btn {
    background: linear-gradient(135deg, #2f7af7 0%, #1e5db8 100%);
    border: 2px solid #4299e1;
    color: white;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 32px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(47, 122, 247, 0.3);
  }
  
  .return-btn:hover {
    background: linear-gradient(135deg, #1e5db8 0%, #2f7af7 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(47, 122, 247, 0.4);
  }
  
  .return-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(47, 122, 247, 0.3);
  }
</style>