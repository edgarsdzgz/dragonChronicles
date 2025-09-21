--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/27*Assets*Audio*VFX*Pipelines.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 27 — Assets: Audio/VFX Pipelines

## Asset Pipeline Overview

### Asset Management System

````typescript

export interface AssetPipeline {
  // Asset Types
  assets: {
    images: ImageAsset[];
    audio: AudioAsset[];
    models: ModelAsset[];
    animations: AnimationAsset[];
    shaders: ShaderAsset[];
    fonts: FontAsset[];
  };

  // Pipeline Stages
  stages: {
    import: ImportStage;
    processing: ProcessingStage;
    optimization: OptimizationStage;
    integration: IntegrationStage;
    deployment: DeploymentStage;
  };

  // Quality Control
  qualityControl: {
    validation: ValidationStage;
    testing: TestingStage;
    approval: ApprovalStage;
  };
}

```javascript

### Asset Classification

```typescript

export interface AssetClassification {
  // Priority Levels
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Performance Impact
  performanceImpact: 'low' | 'medium' | 'high';

  // Platform Requirements
  platforms: ('desktop' | 'mobile' | 'tablet')[];

  // Quality Levels
  qualityLevels: {
    low: AssetVariant;
    medium: AssetVariant;
    high: AssetVariant;
    ultra: AssetVariant;
  };
}

```text

## Image Asset Pipeline

### Image Processing

```typescript

export class ImageProcessor {
  private formats: ImageFormat[] = ['webp', 'png', 'jpg'];
  private qualityLevels: QualityLevel[] = ['low', 'medium', 'high', 'ultra'];

  async processImage(input: ImageInput): Promise<ProcessedImage> {
    const processed: ProcessedImage = {
      original: input,
      variants: []
    };

    // Generate variants for each quality level
    for (const quality of this.qualityLevels) {
      const variant = await this.generateVariant(input, quality);
      processed.variants.push(variant);
    }

    // Generate formats for each variant
    for (const variant of processed.variants) {
      variant.formats = await this.generateFormats(variant);
    }

    return processed;
  }

private async generateVariant(input: ImageInput, quality: QualityLevel):
Promise<ImageVariant>
{
    const config = this.getQualityConfig(quality);

    return {
      quality,
      width: Math.floor(input.width * config.scale),
      height: Math.floor(input.height * config.scale),
      compression: config.compression,
      formats: []
    };
  }

  private async generateFormats(variant: ImageVariant): Promise<ImageFormat[]> {
    const formats: ImageFormat[] = [];

    // WebP (preferred)
    formats.push(await this.generateWebP(variant));

    // PNG (for transparency)
    if (variant.hasTransparency) {
      formats.push(await this.generatePNG(variant));
    }

    // JPEG (fallback)
    formats.push(await this.generateJPEG(variant));

    return formats;
  }

  private getQualityConfig(quality: QualityLevel): QualityConfig {
    const configs = {
      low: { scale: 0.5, compression: 0.7 },
      medium: { scale: 0.75, compression: 0.8 },
      high: { scale: 1.0, compression: 0.9 },
      ultra: { scale: 1.0, compression: 0.95 }
    };

    return configs[quality];
  }
}

```javascript

### Sprite Atlas Generation

```typescript

export class SpriteAtlasGenerator {
  private maxAtlasSize: number = 2048;
  private padding: number = 2;

  async generateAtlas(sprites: Sprite[]): Promise<SpriteAtlas> {
    // Sort sprites by size (largest first)
    const sortedSprites = sprites.sort((a, b) =>
      (b.width * b.height) - (a.width * a.height)
    );

    // Pack sprites into atlas
    const atlas = await this.packSprites(sortedSprites);

    // Generate atlas metadata
    const metadata = this.generateMetadata(atlas);

    return {
      texture: atlas.texture,
      metadata,
      sprites: atlas.sprites
    };
  }

  private async packSprites(sprites: Sprite[]): Promise<PackedAtlas> {
    const bins: Bin[] = [];
    const packedSprites: PackedSprite[] = [];

    for (const sprite of sprites) {
      let placed = false;

      // Try to place in existing bins
      for (const bin of bins) {
        if (bin.canFit(sprite)) {
          const position = bin.place(sprite);
          packedSprites.push({
            sprite,
            position,
            bin: bin.id
          });
          placed = true;
          break;
        }
      }

      // Create new bin if needed
      if (!placed) {
        const newBin = new Bin(this.maxAtlasSize);
        const position = newBin.place(sprite);
        bins.push(newBin);
        packedSprites.push({
          sprite,
          position,
          bin: newBin.id
        });
      }
    }

    return {
      bins,
      sprites: packedSprites,
      texture: await this.renderAtlas(bins)
    };
  }
}

```text

## Audio Asset Pipeline

### Audio Processing

```typescript

export class AudioProcessor {
  private formats: AudioFormat[] = ['ogg', 'mp3', 'wav'];
  private qualityLevels: AudioQuality[] = ['low', 'medium', 'high'];

  async processAudio(input: AudioInput): Promise<ProcessedAudio> {
    const processed: ProcessedAudio = {
      original: input,
      variants: []
    };

    // Generate variants for each quality level
    for (const quality of this.qualityLevels) {
      const variant = await this.generateAudioVariant(input, quality);
      processed.variants.push(variant);
    }

    // Generate formats for each variant
    for (const variant of processed.variants) {
      variant.formats = await this.generateAudioFormats(variant);
    }

    return processed;
  }

private async generateAudioVariant(input: AudioInput, quality: AudioQuality):
Promise<AudioVariant>
{
    const config = this.getAudioQualityConfig(quality);

    return {
      quality,
      sampleRate: config.sampleRate,
      bitRate: config.bitRate,
      channels: config.channels,
      formats: []
    };
  }

  private async generateAudioFormats(variant: AudioVariant): Promise<AudioFormat[]> {
    const formats: AudioFormat[] = [];

    // OGG (preferred for web)
    formats.push(await this.generateOGG(variant));

    // MP3 (fallback)
    formats.push(await this.generateMP3(variant));

    // WAV (uncompressed for short sounds)
    if (variant.duration < 5) {
      formats.push(await this.generateWAV(variant));
    }

    return formats;
  }

  private getAudioQualityConfig(quality: AudioQuality): AudioQualityConfig {
    const configs = {
      low: { sampleRate: 22050, bitRate: 96, channels: 1 },
      medium: { sampleRate: 44100, bitRate: 128, channels: 2 },
      high: { sampleRate: 48000, bitRate: 192, channels: 2 }
    };

    return configs[quality];
  }
}

```javascript

### Audio Management

```typescript

export class AudioManager {
  private audioContext: AudioContext;
  private soundPool: Map<string, AudioBuffer[]> = new Map();
  private musicTracks: Map<string, AudioBuffer> = new Map();
  private sfxTracks: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.audioContext = new AudioContext();
    this.initializeAudioSystem();
  }

  async loadSound(soundId: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Add to sound pool
      if (!this.soundPool.has(soundId)) {
        this.soundPool.set(soundId, []);
      }

      this.soundPool.get(soundId)!.push(audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${soundId}`, error);
    }
  }

  async playSound(soundId: string, options: PlaySoundOptions = {}): Promise<AudioNode> {
    const soundPool = this.soundPool.get(soundId);
    if (!soundPool || soundPool.length === 0) {
      throw new Error(`Sound not found: ${soundId}`);
    }

    // Get available sound from pool
    const audioBuffer = soundPool.find(buffer => !buffer.inUse) || soundPool[0];

    // Create audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Apply effects
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 1.0;

    // Connect audio graph
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play sound
    source.start();

    return source;
  }

  async playMusic(musicId: string, options: PlayMusicOptions = {}): Promise<AudioNode> {
    const audioBuffer = this.musicTracks.get(musicId);
    if (!audioBuffer) {
      throw new Error(`Music track not found: ${musicId}`);
    }

    // Create audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = options.loop || false;

    // Apply effects
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 0.5;

    // Connect audio graph
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play music
    source.start();

    return source;
  }
}

```text

## VFX Pipeline

### Particle System

```typescript

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: ParticleEmitter[] = [];
  private renderer: ParticleRenderer;

  constructor(renderer: ParticleRenderer) {
    this.renderer = renderer;
  }

  createEmitter(config: EmitterConfig): ParticleEmitter {
    const emitter = new ParticleEmitter(config);
    this.emitters.push(emitter);
    return emitter;
  }

  update(deltaTime: number): void {
    // Update emitters
    for (const emitter of this.emitters) {
      emitter.update(deltaTime);

      // Spawn new particles
      const newParticles = emitter.spawnParticles(deltaTime);
      this.particles.push(...newParticles);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);

      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Render particles
    this.renderer.render(this.particles);
  }

createEffect(effectType: EffectType, position: Vector2, options: EffectOptions = {}): void
{
    const config = this.getEffectConfig(effectType, options);
    const emitter = this.createEmitter({
      ...config,
      position: position
    });

    // Auto-destroy emitter after duration
    setTimeout(() => {
      this.destroyEmitter(emitter);
    }, config.duration);
  }

  private getEffectConfig(effectType: EffectType, options: EffectOptions): EmitterConfig {
    const configs = {
      explosion: {
        particleCount: 50,
        particleLife: 1.0,
        particleSpeed: 200,
        particleSize: 10,
        color: [1, 0.5, 0, 1],
        duration: 2.0
      },
      fire: {
        particleCount: 30,
        particleLife: 2.0,
        particleSpeed: 100,
        particleSize: 5,
        color: [1, 0, 0, 1],
        duration: 5.0
      },
      ice: {
        particleCount: 20,
        particleLife: 1.5,
        particleSpeed: 80,
        particleSize: 8,
        color: [0, 0.5, 1, 1],
        duration: 3.0
      }
    };

    return { ...configs[effectType], ...options };
  }
}

```bash

### Shader System

```typescript

export class ShaderManager {
  private shaders: Map<string, Shader> = new Map();
  private shaderPrograms: Map<string, ShaderProgram> = new Map();

async loadShader(name: string, vertexSource: string, fragmentSource: string):
Promise<void>
{
    const vertexShader = this.compileShader(vertexSource, 'vertex');
    const fragmentShader = this.compileShader(fragmentSource, 'fragment');

    const program = this.createProgram(vertexShader, fragmentShader);

    this.shaderPrograms.set(name, program);
  }

  private compileShader(source: string, type: 'vertex' | 'fragment'): WebGLShader {
    const gl = this.getGLContext();
    const shader = gl.createShader(
      type === 'vertex' ? gl.VERTEX*SHADER : gl.FRAGMENT*SHADER
    );

    if (!shader) {
      throw new Error('Failed to create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }

    return shader;
  }

private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader):
ShaderProgram
{
    const gl = this.getGLContext();
    const program = gl.createProgram();

    if (!program) {
      throw new Error('Failed to create shader program');
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program linking error: ${error}`);
    }

    return program;
  }

  useShader(name: string): void {
    const program = this.shaderPrograms.get(name);
    if (!program) {
      throw new Error(`Shader not found: ${name}`);
    }

    const gl = this.getGLContext();
    gl.useProgram(program);
  }
}

```text

## Asset Optimization

### Compression Pipeline

```typescript

export class AssetCompressor {
  private compressionConfigs: Map<string, CompressionConfig> = new Map();

  constructor() {
    this.initializeCompressionConfigs();
  }

  private initializeCompressionConfigs(): void {
    // Image compression
    this.compressionConfigs.set('image', {
      webp: { quality: 80, lossless: false },
      png: { compression: 6, interlaced: false },
      jpg: { quality: 85, progressive: true }
    });

    // Audio compression
    this.compressionConfigs.set('audio', {
      ogg: { quality: 5, bitrate: 128 },
      mp3: { quality: 2, bitrate: 128 }
    });
  }

  async compressImage(image: ImageAsset, format: string): Promise<CompressedImage> {
    const config = this.compressionConfigs.get('image')![format];

    switch (format) {
      case 'webp':
        return await this.compressWebP(image, config);
      case 'png':
        return await this.compressPNG(image, config);
      case 'jpg':
        return await this.compressJPEG(image, config);
      default:
        throw new Error(`Unsupported image format: ${format}`);
    }
  }

  async compressAudio(audio: AudioAsset, format: string): Promise<CompressedAudio> {
    const config = this.compressionConfigs.get('audio')![format];

    switch (format) {
      case 'ogg':
        return await this.compressOGG(audio, config);
      case 'mp3':
        return await this.compressMP3(audio, config);
      default:
        throw new Error(`Unsupported audio format: ${format}`);
    }
  }
}

```javascript

### LOD System

```typescript

export class LODManager {
  private lodLevels: LODLevel[] = ['ultra', 'high', 'medium', 'low'];
  private currentLODLevel: LODLevel = 'high';

  setLODLevel(level: LODLevel): void {
    this.currentLODLevel = level;
    this.applyLODSettings();
  }

  private applyLODSettings(): void {
    const settings = this.getLODSettings(this.currentLODLevel);

    // Apply image quality settings
    this.applyImageLOD(settings.image);

    // Apply audio quality settings
    this.applyAudioLOD(settings.audio);

    // Apply VFX settings
    this.applyVFXLOD(settings.vfx);
  }

  private getLODSettings(level: LODLevel): LODSettings {
    const settings = {
      ultra: {
        image: { quality: 1.0, maxSize: 2048 },
        audio: { quality: 'high', maxChannels: 32 },
        vfx: { particleCount: 1000, effects: true }
      },
      high: {
        image: { quality: 0.8, maxSize: 1024 },
        audio: { quality: 'medium', maxChannels: 16 },
        vfx: { particleCount: 500, effects: true }
      },
      medium: {
        image: { quality: 0.6, maxSize: 512 },
        audio: { quality: 'medium', maxChannels: 8 },
        vfx: { particleCount: 250, effects: true }
      },
      low: {
        image: { quality: 0.4, maxSize: 256 },
        audio: { quality: 'low', maxChannels: 4 },
        vfx: { particleCount: 100, effects: false }
      }
    };

    return settings[level];
  }
}

```text

## Asset Loading

### Asset Loader

```typescript

export class AssetLoader {
  private loadedAssets: Map<string, Asset> = new Map();
  private loadingPromises: Map<string, Promise<Asset>> = new Map();
  private loadingQueue: AssetLoadRequest[] = [];
  private maxConcurrentLoads: number = 3;
  private currentlyLoading: number = 0;

  async loadAsset(request: AssetLoadRequest): Promise<Asset> {
    // Check if already loaded
    if (this.loadedAssets.has(request.id)) {
      return this.loadedAssets.get(request.id)!;
    }

    // Check if currently loading
    if (this.loadingPromises.has(request.id)) {
      return this.loadingPromises.get(request.id)!;
    }

    // Create loading promise
    const loadingPromise = this.loadAssetInternal(request);
    this.loadingPromises.set(request.id, loadingPromise);

    try {
      const asset = await loadingPromise;
      this.loadedAssets.set(request.id, asset);
      return asset;
    } finally {
      this.loadingPromises.delete(request.id);
    }
  }

  private async loadAssetInternal(request: AssetLoadRequest): Promise<Asset> {
    // Wait for available slot
    await this.waitForLoadingSlot();

    this.currentlyLoading++;

    try {
      let asset: Asset;

      switch (request.type) {
        case 'image':
          asset = await this.loadImage(request);
          break;
        case 'audio':
          asset = await this.loadAudio(request);
          break;
        case 'model':
          asset = await this.loadModel(request);
          break;
        default:
          throw new Error(`Unsupported asset type: ${request.type}`);
      }

      return asset;
    } finally {
      this.currentlyLoading--;
      this.processLoadingQueue();
    }
  }

  private async waitForLoadingSlot(): Promise<void> {
    if (this.currentlyLoading < this.maxConcurrentLoads) {
      return;
    }

    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.currentlyLoading < this.maxConcurrentLoads) {
          resolve();
        } else {
          setTimeout(checkSlot, 10);
        }
      };
      checkSlot();
    });
  }

  private async loadImage(request: AssetLoadRequest): Promise<ImageAsset> {
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        resolve({
          id: request.id,
          type: 'image',
          element: img,
          width: img.width,
          height: img.height,
          url: request.url
        });
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${request.url}`));
      };

      img.src = request.url;
    });
  }
}

```javascript

## Acceptance Criteria

- [ ] Asset pipeline supports all required asset types

- [ ] Image processing generates appropriate quality variants

- [ ] Audio processing supports multiple formats and quality levels

- [ ] VFX system provides particle effects and shaders

- [ ] Asset optimization reduces file sizes while maintaining quality

- [ ] LOD system adjusts asset quality based on performance

- [ ] Asset loading system manages concurrent loads efficiently

- [ ] Sprite atlas generation optimizes texture memory usage

- [ ] Audio management provides sound pooling and effects

- [ ] Shader system supports custom visual effects
````
