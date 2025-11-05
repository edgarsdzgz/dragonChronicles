<script lang="ts">
  import { onMount } from 'svelte';
  import { Application } from 'pixi.js';
  import { ProfileShapesTestManager } from '$lib/pixi/systems/profile-shapes-test';

  let canvas: HTMLCanvasElement;
  let app: Application | null = null;
  let testManager: ProfileShapesTestManager | null = null;

  onMount(async () => {
    // Create PixiJS application with green background (Draconia theme)
    app = new Application();
    await app.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0d4f3c, // Draconia green background
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Create test manager and display shapes
    testManager = new ProfileShapesTestManager(app);
    testManager.displayTestShapes();

    // Handle window resize
    const handleResize = () => {
      if (!app) return;
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      testManager?.destroy();
      app?.destroy(true, { children: true });
    };
  });
</script>

<svelte:head>
  <title>Profile Shapes Test - Draconia Chronicles</title>
</svelte:head>

<div class="profile-shapes-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .profile-shapes-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
