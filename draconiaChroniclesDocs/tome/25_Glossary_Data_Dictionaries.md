--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/25*Glossary*Data*Dictionaries.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 25 — Glossary & Data Dictionaries

## Core Game Terms

### Gameplay Terminology

```typescript

export interface GameplayTerms {
  // Core Concepts
  Journey: 'A single expedition from Draconia, ending in Return or death';
  Return: 'The act of returning to Draconia to spend Arcana and reset enchants';
  Draconia: 'The player\'s home base and safe haven';

  // Progression
  Distance: 'Meters traveled from Draconia (primary progression metric)';
  Ward: 'Sub-region within a Land, with specific scaling and content';
  Land: 'Major region with distinct theme, enemies, and mechanics';

  // Combat
  AutoCombat: 'Automatic dragon attacks that form the core combat loop';
  ManualAbilities: 'Player-activated abilities that contribute ~20% of damage';
  ElementalCounterplay: 'Strategic use of Fire/Ice/Lightning/Poison interactions';

  // Economy
  Arcana: 'Run-bound currency earned from defeating enemies';
  SoulPower: 'Permanent meta-progression currency';
  Gold: 'Persistent quality-of-life currency';
  AstralSeals: 'Premium currency with lore significance';

  // Research
  Discovery: 'The process of revealing hidden tech nodes through research';
  Unlock: 'The process of making discovered nodes available for purchase';
  ResearchLab: 'The system that enables discovery of new tech nodes';
}

```javascript

### Technical Terminology

```typescript

export interface TechnicalTerms {
  // Architecture
  Monorepo: 'Single repository containing multiple related packages';
  WebWorkers: 'Background threads for running game simulation';
  PixiJS: 'WebGL-based 2D rendering engine';
  SvelteKit: 'Full-stack web framework for the frontend';
  Dexie: 'IndexedDB wrapper for client-side database';

  // Performance
  ObjectPooling: 'Reusing objects to avoid garbage collection';
  Culling: 'Removing off-screen objects from rendering';
  LOD: 'Level of Detail - reducing quality for distant objects';
  FrameRate: 'Frames per second - target 60fps desktop, ≥40fps mobile';

  // Data
  Deterministic: 'Same inputs always produce same outputs';
  Serialization: 'Converting data structures to/from storage format';
  Migration: 'Updating data schema between versions';
  Validation: 'Ensuring data meets expected format and constraints';
}

```text

## Data Dictionaries

### Profile Data Schema

```typescript

export interface ProfileDataDictionary {
  // Core Profile
  id: {
    type: 'string';
    format: 'UUID';
    description: 'Unique identifier for the profile';
    example: '550e8400-e29b-41d4-a716-446655440000';
    constraints: 'Required, unique, immutable';
  };

  name: {
    type: 'string';
    format: 'UTF-8';
    description: 'Player-chosen dragon name';
    example: 'Flametail';
    constraints: 'Required, 1-50 characters, alphanumeric + spaces/hyphens/underscores';
  };

  createdAt: {
    type: 'number';
    format: 'Unix timestamp';
    description: 'When the profile was created';
    example: 1640995200000;
    constraints: 'Required, immutable, milliseconds since epoch';
  };

  lastActive: {
    type: 'number';
    format: 'Unix timestamp';
    description: 'When the profile was last accessed';
    example: 1640995200000;
    constraints: 'Required, updated on each session start';
  };

  // Progression Data
  currentLand: {
    type: 'number';
    format: 'Integer';
    description: 'Current land the player is in';
    example: 1;
    constraints: 'Required, ≥1, ≤10 (current max)';
  };

  currentWard: {
    type: 'number';
    format: 'Integer';
    description: 'Current ward within the land';
    example: 3;
    constraints: 'Required, ≥1, ≤10 (current max per land)';
  };

  currentDistanceM: {
    type: 'number';
    format: 'Float';
    description: 'Current distance in meters from Draconia';
    example: 1250.5;
    constraints: 'Required, ≥0, precision to 1 decimal place';
  };

  maxDistanceReached: {
    type: 'number';
    format: 'Float';
    description: 'Farthest distance ever reached';
    example: 2500.0;
    constraints: 'Required, ≥0, precision to 1 decimal place';
  };

  // Currency Data
  currencies: {
    type: 'object';
    description: 'All player currencies';
    properties: {
      arcana: {
        type: 'number';
        format: 'Integer';
        description: 'Run-bound currency for enchants';
        example: 1500;
        constraints: '≥0, resets on Return';
      };
      soulPower: {
        type: 'number';
        format: 'Integer';
        description: 'Permanent meta-progression currency';
        example: 250;
        constraints: '≥0, persistent across runs';
      };
      gold: {
        type: 'number';
        format: 'Integer';
        description: 'Quality-of-life currency';
        example: 5000;
        constraints: '≥0, persistent across runs';
      };
      astralSeals: {
        type: 'number';
        format: 'Integer';
        description: 'Premium currency';
        example: 15;
        constraints: '≥0, persistent across runs';
      };
    };
  };
}

```javascript

### Combat Data Schema

```typescript

export interface CombatDataDictionary {
  // Enemy Data
  enemy: {
    id: {
      type: 'string';
      format: 'UUID';
      description: 'Unique identifier for this enemy instance';
      example: 'enemy_12345';
      constraints: 'Required, unique per instance';
    };

    type: {
      type: 'string';
      format: 'Enum';
      description: 'Enemy type classification';
      example: 'minion';
      constraints: 'Required, one of: minion, elite, boss';
    };

    baseHP: {
      type: 'number';
      format: 'Integer';
      description: 'Base health points before scaling';
      example: 100;
      constraints: 'Required, >0';
    };

    currentHP: {
      type: 'number';
      format: 'Float';
      description: 'Current health points';
      example: 75.5;
      constraints: 'Required, ≥0, ≤baseHP';
    };

    baseDamage: {
      type: 'number';
      format: 'Integer';
      description: 'Base damage per attack before scaling';
      example: 10;
      constraints: 'Required, >0';
    };

    position: {
      type: 'object';
      description: 'Enemy position in world coordinates';
      properties: {
        x: {
          type: 'number';
          format: 'Float';
          description: 'X coordinate';
          example: 150.5;
          constraints: 'Required, precision to 1 decimal place';
        };
        y: {
          type: 'number';
          format: 'Float';
          description: 'Y coordinate';
          example: 200.0;
          constraints: 'Required, precision to 1 decimal place';
        };
      };
    };

    aiState: {
      type: 'string';
      format: 'Enum';
      description: 'Current AI behavior state';
      example: 'ATTACK';
      constraints: 'Required, one of: APPROACH, STOP*AT*RANGE, ATTACK, REPOSITION, DEAD';
    };
  };

  // Dragon Data
  dragon: {
    health: {
      type: 'number';
      format: 'Float';
      description: 'Current dragon health';
      example: 800.0;
      constraints: 'Required, ≥0, ≤maxHealth';
    };

    maxHealth: {
      type: 'number';
      format: 'Float';
      description: 'Maximum dragon health';
      example: 1000.0;
      constraints: 'Required, >0';
    };

    breathWeapon: {
      type: 'object';
      description: 'Dragon\'s breath weapon configuration';
      properties: {
        baseDamage: {
          type: 'number';
          format: 'Integer';
          description: 'Base damage per tick';
          example: 25;
          constraints: 'Required, >0';
        };
        damageType: {
          type: 'string';
          format: 'Enum';
          description: 'Elemental damage type';
          example: 'fire';
          constraints: 'Required, one of: fire, ice, lightning, poison';
        };
        range: {
          type: 'number';
          format: 'Float';
          description: 'Attack range in pixels';
          example: 400.0;
          constraints: 'Required, >0';
        };
        coneWidth: {
          type: 'number';
          format: 'Float';
          description: 'Cone width in degrees';
          example: 45.0;
          constraints: 'Required, >0, ≤180';
        };
      };
    };
  };
}

```javascript

### Research Data Schema

```typescript

export interface ResearchDataDictionary {
  // Research Node
  researchNode: {
    id: {
      type: 'string';
      format: 'String';
      description: 'Unique identifier for the research node';
      example: 'fire.resinStill';
      constraints: 'Required, unique, follows naming convention';
    };

    name: {
      type: 'string';
      format: 'UTF-8';
      description: 'Display name for the research node';
      example: 'Resin Still';
      constraints: 'Required, 1-100 characters';
    };

    tree: {
      type: 'string';
      format: 'Enum';
      description: 'Which tech tree this node belongs to';
      example: 'Fire';
      constraints: 'Required, one of: Fire, Safety, Scales';
    };

    branch: {
      type: 'string';
      format: 'Enum';
      description: 'Branch within the tech tree';
      example: 'Fuel';
      constraints: 'Required, depends on tree';
    };

    status: {
      type: 'string';
      format: 'Enum';
      description: 'Current status of the research node';
      example: 'unlocked';
      constraints: 'Required, one of: unknown, discovered, unlocked, leveled';
    };

    arcanaLevel: {
      type: 'number';
      format: 'Integer';
      description: 'Current level using Arcana currency';
      example: 5;
      constraints: 'Required, ≥0, ≤arcanaCap';
    };

    soulLevel: {
      type: 'number';
      format: 'Integer';
      description: 'Current level using Soul Power currency';
      example: 2;
      constraints: 'Required, ≥0, ≤soulCap';
    };

    arcanaCap: {
      type: 'number';
      format: 'Integer';
      description: 'Maximum level achievable with Arcana';
      example: 12;
      constraints: 'Required, >0';
    };

    soulCap: {
      type: 'number';
      format: 'Integer';
      description: 'Maximum level achievable with Soul Power';
      example: 3;
      constraints: 'Required, >0';
    };

    baseArcanaCost: {
      type: 'number';
      format: 'Integer';
      description: 'Base cost in Arcana for level 1';
      example: 6;
      constraints: 'Required, >0';
    };

    arcanaCostGrowth: {
      type: 'number';
      format: 'Float';
      description: 'Growth multiplier for Arcana costs';
      example: 1.17;
      constraints: 'Required, >1.0';
    };

    baseSoulCost: {
      type: 'number';
      format: 'Integer';
      description: 'Base cost in Soul Power for rank 1';
      example: 15;
      constraints: 'Required, >0';
    };

    soulCostGrowth: {
      type: 'number';
      format: 'Float';
      description: 'Growth multiplier for Soul Power costs';
      example: 1.9;
      constraints: 'Required, >1.0';
    };

    prereqIds: {
      type: 'array';
      format: 'String Array';
      description: 'IDs of prerequisite research nodes';
      example: ['fire.gasGut'];
      constraints: 'Optional, array of valid node IDs';
    };

    scaleGates: {
      type: 'array';
      format: 'String Array';
      description: 'Scales tree gates that affect this node';
      example: ['scales.basicScales'];
      constraints: 'Optional, array of valid node IDs';
    };
  };
}

```javascript

### Economy Data Schema

```typescript

export interface EconomyDataDictionary {
  // Currency Transactions
  currencyTransaction: {
    id: {
      type: 'string';
      format: 'UUID';
      description: 'Unique identifier for the transaction';
      example: 'txn_12345';
      constraints: 'Required, unique';
    };

    profileId: {
      type: 'string';
      format: 'UUID';
      description: 'Profile that made the transaction';
      example: 'profile_67890';
      constraints: 'Required, valid profile ID';
    };

    currencyType: {
      type: 'string';
      format: 'Enum';
      description: 'Type of currency involved';
      example: 'arcana';
      constraints: 'Required, one of: arcana, soulPower, gold, astralSeals';
    };

    amount: {
      type: 'number';
      format: 'Integer';
      description: 'Amount of currency (positive for gain, negative for spend)';
      example: -150;
      constraints: 'Required, non-zero';
    };

    transactionType: {
      type: 'string';
      format: 'Enum';
      description: 'Type of transaction';
      example: 'enchant_upgrade';
constraints: 'Required, one of: enemy*kill, enchant*upgrade, research*purchase, item*sale,
etc.';
    };

    timestamp: {
      type: 'number';
      format: 'Unix timestamp';
      description: 'When the transaction occurred';
      example: 1640995200000;
      constraints: 'Required, milliseconds since epoch';
    };

    context: {
      type: 'object';
      format: 'JSON';
      description: 'Additional context about the transaction';
      example: { enemyType: 'minion', distance: 1250 };
      constraints: 'Optional, varies by transaction type';
    };
  };

  // Item Data
  item: {
    id: {
      type: 'string';
      format: 'String';
      description: 'Unique identifier for the item type';
      example: 'crystal_shard';
      constraints: 'Required, unique, follows naming convention';
    };

    name: {
      type: 'string';
      format: 'UTF-8';
      description: 'Display name for the item';
      example: 'Crystal Shard';
      constraints: 'Required, 1-100 characters';
    };

    rarity: {
      type: 'string';
      format: 'Enum';
      description: 'Item rarity level';
      example: 'rare';
      constraints: 'Required, one of: common, uncommon, rare, epic';
    };

    baseValue: {
      type: 'number';
      format: 'Integer';
      description: 'Base gold value of the item';
      example: 50;
      constraints: 'Required, >0';
    };

    condition: {
      type: 'string';
      format: 'Enum';
      description: 'Item condition affecting value';
      example: 'good';
      constraints: 'Required, one of: poor, fair, good, excellent';
    };

    appraisalValue: {
      type: 'number';
      format: 'Integer';
      description: 'Final value after appraisal';
      example: 60;
      constraints: 'Required, >0, includes condition modifiers';
    };
  };
}

```javascript

### Telemetry Data Schema

```typescript

export interface TelemetryDataDictionary {
  // Telemetry Event
  telemetryEvent: {
    id: {
      type: 'string';
      format: 'UUID';
      description: 'Unique identifier for the event';
      example: 'evt_12345';
      constraints: 'Required, unique';
    };

    timestamp: {
      type: 'number';
      format: 'Unix timestamp';
      description: 'When the event occurred';
      example: 1640995200000;
      constraints: 'Required, milliseconds since epoch';
    };

    sessionId: {
      type: 'string';
      format: 'UUID';
      description: 'Session identifier';
      example: 'sess_67890';
      constraints: 'Required, valid session ID';
    };

    profileId: {
      type: 'string';
      format: 'UUID';
      description: 'Profile identifier (may be anonymized)';
      example: 'profile_11111';
      constraints: 'Required, valid profile ID';
    };

    eventType: {
      type: 'string';
      format: 'String';
      description: 'Type of event that occurred';
      example: 'enemy_killed';
      constraints: 'Required, follows naming convention';
    };

    eventData: {
      type: 'object';
      format: 'JSON';
      description: 'Event-specific data';
      example: { enemyType: 'minion', distance: 1250, arcanaReward: 10 };
      constraints: 'Required, varies by event type';
    };

    context: {
      type: 'object';
      format: 'JSON';
      description: 'Additional context about the event';
      example: { land: 1, ward: 3, labLevel: 2 };
      constraints: 'Optional, provides additional context';
    };
  };

  // Performance Metric
  performanceMetric: {
    id: {
      type: 'string';
      format: 'UUID';
      description: 'Unique identifier for the metric';
      example: 'perf_12345';
      constraints: 'Required, unique';
    };

    timestamp: {
      type: 'number';
      format: 'Unix timestamp';
      description: 'When the metric was recorded';
      example: 1640995200000;
      constraints: 'Required, milliseconds since epoch';
    };

    metricType: {
      type: 'string';
      format: 'Enum';
      description: 'Type of performance metric';
      example: 'fps';
      constraints: 'Required, one of: fps, frameTime, memoryUsage, loadTime';
    };

    value: {
      type: 'number';
      format: 'Float';
      description: 'Metric value';
      example: 58.5;
      constraints: 'Required, varies by metric type';
    };

    unit: {
      type: 'string';
      format: 'String';
      description: 'Unit of measurement';
      example: 'fps';
      constraints: 'Required, matches metric type';
    };

    tags: {
      type: 'object';
      format: 'JSON';
      description: 'Additional tags for categorization';
      example: { device: 'desktop', browser: 'chrome' };
      constraints: 'Optional, key-value pairs';
    };
  };
}

```javascript

## API Data Formats

### Request/Response Formats

```typescript

export interface APIFormats {
  // Standard Response Format
  apiResponse: {
    success: {
      type: 'boolean';
      description: 'Whether the request was successful';
      example: true;
      constraints: 'Required';
    };

    data: {
      type: 'any';
      description: 'Response data (varies by endpoint)';
      example: { profile: { id: '123', name: 'Flametail' } };
      constraints: 'Required if success is true';
    };

    error: {
      type: 'object';
      description: 'Error information (only if success is false)';
      example: { code: 'VALIDATION_ERROR', message: 'Invalid input' };
      constraints: 'Required if success is false';
    };

    timestamp: {
      type: 'number';
      description: 'Response timestamp';
      example: 1640995200000;
      constraints: 'Required, Unix timestamp in milliseconds';
    };
  };

  // Pagination Format
  pagination: {
    page: {
      type: 'number';
      description: 'Current page number (1-based)';
      example: 1;
      constraints: 'Required, ≥1';
    };

    pageSize: {
      type: 'number';
      description: 'Number of items per page';
      example: 20;
      constraints: 'Required, 1-100';
    };

    totalItems: {
      type: 'number';
      description: 'Total number of items';
      example: 150;
      constraints: 'Required, ≥0';
    };

    totalPages: {
      type: 'number';
      description: 'Total number of pages';
      example: 8;
      constraints: 'Required, ≥0';
    };

    hasNext: {
      type: 'boolean';
      description: 'Whether there is a next page';
      example: true;
      constraints: 'Required';
    };

    hasPrevious: {
      type: 'boolean';
      description: 'Whether there is a previous page';
      example: false;
      constraints: 'Required';
    };
  };
}

```text

## Validation Rules

### Data Validation

```typescript

export interface ValidationRules {
  // String Validation
  string: {
    minLength: 'Minimum character count';
    maxLength: 'Maximum character count';
    pattern: 'Regular expression pattern';
    trim: 'Remove leading/trailing whitespace';
    sanitize: 'Remove potentially dangerous characters';
  };

  // Number Validation
  number: {
    min: 'Minimum value';
    max: 'Maximum value';
    integer: 'Must be whole number';
    precision: 'Decimal places allowed';
    positive: 'Must be greater than 0';
  };

  // Array Validation
  array: {
    minItems: 'Minimum number of items';
    maxItems: 'Maximum number of items';
    uniqueItems: 'All items must be unique';
    itemSchema: 'Validation schema for array items';
  };

  // Object Validation
  object: {
    required: 'Required properties';
    additionalProperties: 'Allow additional properties';
    propertySchemas: 'Validation schemas for properties';
  };
}

```text

## Error Codes

### Standard Error Codes

```typescript

export interface ErrorCodes {
  // Validation Errors
  VALIDATION_ERROR: 'Input data failed validation';
  INVALID_FORMAT: 'Data format is invalid';
  MISSING_REQUIRED: 'Required field is missing';
  INVALID_RANGE: 'Value is outside allowed range';

  // Authentication Errors
  UNAUTHORIZED: 'User is not authenticated';
  FORBIDDEN: 'User lacks permission for action';
  SESSION_EXPIRED: 'User session has expired';
  INVALID_CREDENTIALS: 'Authentication credentials are invalid';

  // Resource Errors
  NOT_FOUND: 'Requested resource not found';
  CONFLICT: 'Resource conflict (e.g., duplicate)';
  RATE_LIMITED: 'Request rate limit exceeded';
  QUOTA_EXCEEDED: 'Resource quota exceeded';

  // System Errors
  INTERNAL_ERROR: 'Internal server error';
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable';
  TIMEOUT: 'Request timed out';
  MAINTENANCE: 'System under maintenance';
}

```text

## Acceptance Criteria

- [ ] All game terms are clearly defined and consistent

- [ ] Data schemas are complete and well-documented

- [ ] Validation rules are comprehensive and enforced

- [ ] API formats are standardized and consistent

- [ ] Error codes provide clear error information

- [ ] Data dictionaries are maintained and up-to-date

- [ ] Terminology is consistent across all documentation

- [ ] Examples are provided for all data types

- [ ] Constraints are clearly specified

- [ ] Format requirements are documented
