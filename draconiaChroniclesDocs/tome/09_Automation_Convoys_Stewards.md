--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/09*Automation*Convoys*Stewards.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 09 — Automation: Roads, Convoys & Stewards

## Automation Philosophy

### Design Principles

- **Risk vs Reward**: Higher risk routes offer better rewards

- **Downtime, Not Loss**: Incidents cause delays, never permanent item loss

- **Bounded Risk**: Player can control risk level through guard investment

- **Offline Operation**: Automation continues while player is away

- **Combat Subordinate**: Automation enhances but never replaces core combat loop

### Automation Timeline

1. **Phase 1**: Single route with basic guards

1. **Phase 2**: Multiple routes and guard specialization

1. **Phase 3**: Steward contracts and delegation

1. **Phase 4**: Advanced automation and optimization

## Transport Network System

### Route Architecture

```typescript

export interface TransportRoute {
  id: string;
  name: string;
  startNode: TransportNode;
  endNode: TransportNode;

  // Route Properties
  distance: number; // travel time in hours
  difficulty: number; // 1-5, affects incident rate
  terrain: TerrainType[];
  weatherRisk: number; // 0-100, weather-related incidents

  // Capacity & Efficiency
  baseCapacity: number; // items per trip
  speedModifier: number; // 0.5-2.0, affects travel time
  costPerTrip: number; // operational cost

  // Safety & Security
  guardRequirements: GuardRequirement[];
  currentGuards: Guard[];
  safetyIndex: number; // 0-100, calculated from guards
}

```javascript

### Transport Nodes

```typescript

export interface TransportNode {
  id: string;
  name: string;
  type: 'city' | 'outpost' | 'waypoint' | 'resource_site';
  location: Vector2;

  // Node Capabilities
  storage: StorageCapacity;
  processing: ProcessingCapacity;
  services: ServiceType[];

  // Security
  baseSecurity: number; // inherent security level
  guardStation: GuardStation;
  fortifications: Fortification[];
}

```javascript

### Safety Index Calculation

```typescript

export function calculateSafetyIndex(route: TransportRoute): number {
  const baseSafety = 50; // neutral starting point

  // Guard contribution
  const guardBonus = route.currentGuards.reduce((total, guard) => {
    return total + (guard.skill * guard.level * guard.specialization);
  }, 0);

  // Route difficulty penalty
  const difficultyPenalty = route.difficulty * 10;

  // Weather risk penalty
  const weatherPenalty = route.weatherRisk * 0.3;

  // Calculate final safety index
  const safetyIndex = Math.max(0, Math.min(100,
    baseSafety + guardBonus - difficultyPenalty - weatherPenalty
  ));

  return Math.round(safetyIndex);
}

```text

## Guard System

### Guard Types & Specializations

```typescript

export interface Guard {
  id: string;
  name: string;
  type: 'warrior' | 'scout' | 'mage' | 'healer';
  level: number; // 1-10
  skill: number; // 0-100, affects effectiveness

  // Specializations
  specialization: GuardSpecialization;
  experience: ExperiencePoints;

  // Combat Stats
  health: number;
  damage: number;
  defense: number;
  speed: number;

  // Contract Terms
  wage: number; // daily cost
  contractLength: number; // days remaining
  loyalty: number; // 0-100, affects performance
}

export interface GuardSpecialization {
  type: 'bandit*hunter' | 'weather*ward' | 'beast*tamer' | 'route*guide';
  effectiveness: number; // 0-100, how good they are at their specialty
  bonusEffects: SpecializationBonus[];
}

```javascript

### Guard Station Management

```typescript

export interface GuardStation {
  id: string;
  name: string;
  location: TransportNode;

  // Capacity
  maxGuards: number;
  currentGuards: Guard[];
  barracks: Barracks;

  // Services
  training: TrainingFacility;
  equipment: EquipmentStorage;
  medical: MedicalFacility;

  // Operations
  patrolRoutes: PatrolRoute[];
  incidentResponse: IncidentResponse;
}

```text

## Incident System

### Incident Types

```typescript

export interface Incident {
  id: string;
  type: 'bandit*raid' | 'weather*delay' | 'mechanical*failure' | 'beast*attack';
  severity: number; // 1-5, affects duration and impact

  // Timing
  duration: number; // hours of downtime
  recoveryTime: number; // hours to return to normal

  // Impact
  downtimeOnly: boolean; // true = no item loss
  experienceLoss: number; // guards lose some experience
  equipmentDamage: number; // equipment needs repair

  // Resolution
  autoResolve: boolean; // resolves automatically after duration
  playerIntervention: boolean; // player can speed up resolution
  successRate: number; // chance of successful resolution
}

```javascript

### Incident Resolution

```typescript

export interface IncidentResolution {
  incidentId: string;
  resolutionType: 'automatic' | 'player*intervention' | 'guard*success';

  // Outcomes
  downtime: number; // actual downtime experienced
  experienceGain: number; // guards gain experience from handling incident
  equipmentStatus: EquipmentStatus;

  // Rewards (for successful resolution)
  bonusRewards: Reward[];
  reputationGain: number;
}

```text

## Steward Contract System

### Steward Types & Capabilities

```typescript

export interface Steward {
  id: string;
  name: string;
  type: 'junior_dragon' | 'apprentice' | 'experienced' | 'master';
  level: number; // 1-10

  // Core Capabilities
  scrollHunting: number; // 0-100, ability to find scrolls
  materialGathering: number; // 0-100, ability to gather materials
  escortProtection: number; // 0-100, ability to protect caravans
  exploration: number; // 0-100, ability to scout new areas

  // Specializations
  specialization: StewardSpecialization;
  preferredTasks: TaskType[];

  // Contract Details
  wage: number; // daily cost in gold
  contractLength: number; // days
  loyalty: number; // 0-100, affects performance and retention

  // Performance
  successRate: number; // historical success rate
  averageReward: number; // average rewards per task
  riskTolerance: number; // 0-100, affects task selection
}

```javascript

### Steward Specializations

```typescript

export interface StewardSpecialization {
  type: 'scroll*scholar' | 'material*collector' | 'caravan_master' | 'pathfinder';

  // Specialization Bonuses
  primarySkillBonus: number; // +X to primary skill
  secondarySkillBonus: number; // +X to secondary skill
  riskReduction: number; // -X% to incident chance
  rewardMultiplier: number; // +X% to rewards

  // Special Abilities
  uniqueAbilities: SpecialAbility[];
  equipmentPreferences: EquipmentType[];
}

```javascript

### Contract Management

```typescript

export interface StewardContract {
  stewardId: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
  contractType: 'scroll*focus' | 'material*focus' | 'balanced' | 'custom';

  // Terms
  dailyWage: number;
  performanceBonus: number; // bonus for exceeding expectations
  earlyTerminationPenalty: number; // cost to break contract early

  // Performance Tracking
  tasksCompleted: number;
  successRate: number;
  totalRewards: number;
  loyaltyChanges: LoyaltyChange[];
}

```text

## Task Board System

### Available Tasks

```typescript

export interface Task {
  id: string;
  name: string;
  description: string;
  type: 'scroll*hunt' | 'material*gather' | 'escort' | 'exploration' | 'patrol';

  // Requirements
  stewardLevel: number; // minimum steward level required
  specialization: StewardSpecialization[]; // preferred specializations
  timeRequired: number; // hours to complete

  // Risk Assessment
  riskLevel: number; // 1-5, affects success rate and rewards
  incidentChance: number; // percentage chance of incidents
  failurePenalty: number; // cost of failure

  // Rewards
  guaranteedRewards: Reward[];
  bonusRewards: Reward[];
  experienceGain: number;

  // Location
  targetLocation: Vector2;
  travelTime: number; // hours to reach location
}

```javascript

### Task Assignment & Execution

```typescript

export interface TaskAssignment {
  taskId: string;
  stewardId: string;
  assignedDate: number;
  estimatedCompletion: number;

  // Execution Tracking
  currentPhase: TaskPhase;
  progress: number; // 0-100%
  incidents: Incident[];
  modifications: TaskModification[];

  // Outcomes
  actualCompletion: number;
  success: boolean;
  rewards: Reward[];
  experienceGained: number;
}

```javascript

### Pity System for Task Failures

```typescript

export interface TaskPity {
  stewardId: string;
  taskType: TaskType;
  consecutiveFailures: number;
  pityThreshold: number; // guaranteed success after X failures
  pityMultiplier: number; // increased success rate as pity builds

  // Pity Bonuses
  successRateBonus: number; // +X% to success rate
  rewardBonus: number; // +X% to rewards
  experienceBonus: number; // +X% to experience gained
}

```text

## Route Optimization

### Multi-Route Network

```typescript

export interface TransportNetwork {
  routes: TransportRoute[];
  nodes: TransportNode[];

  // Network Properties
  connectivity: number; // how well-connected the network is
  redundancy: number; // alternative routes available
  efficiency: number; // overall network efficiency

  // Optimization
  bottlenecks: Bottleneck[];
  optimizationSuggestions: OptimizationSuggestion[];
  capacityPlanning: CapacityPlan[];
}

```javascript

### Route Planning Algorithm

```typescript

export function findOptimalRoute(
  start: TransportNode,
  end: TransportNode,
  cargo: Cargo,
  constraints: RouteConstraints
): OptimalRoute {
  // Dijkstra's algorithm with custom weights
  const weights = {
    distance: 1.0,
    difficulty: 2.0,
    safety: -1.5, // negative weight (prefer safer routes)
    cost: 0.5,
    time: 1.2
  };

  // Find shortest path considering all factors
  const path = dijkstra(start, end, weights);

  // Calculate route metrics
  const totalTime = calculateTravelTime(path, cargo);
  const totalCost = calculateCost(path, cargo);
  const safetyIndex = calculateRouteSafety(path);

  return {
    path,
    totalTime,
    totalCost,
    safetyIndex,
    estimatedRewards: calculateRewards(path, cargo)
  };
}

```javascript

## Performance & Optimization

### Automation Performance Budgets

```typescript

export interface AutomationPerformance {
  // Update Rates
  routeUpdateRate: number; // updates per minute
  guardUpdateRate: number; // updates per minute
  taskUpdateRate: number; // updates per minute

  // Limits
  maxActiveRoutes: number; // performance limit
  maxActiveGuards: number; // performance limit
  maxActiveTasks: number; // performance limit

  // Optimization
  batchProcessing: boolean; // process multiple updates together
  priorityQueuing: boolean; // prioritize important updates
  lazyEvaluation: boolean; // only calculate when needed
}

```text

### Offline Automation

- **Background Processing**: Automation continues while player offline

- **Accelerated Time**: Automation runs faster offline (2x speed)

- **Incident Handling**: Automatic resolution of minor incidents

- **Progress Summaries**: Clear reports when player returns

## UI/UX Design

### Automation Dashboard

```typescript

export interface AutomationDashboard {
  // Overview
  activeRoutes: TransportRoute[];
  activeTasks: TaskAssignment[];
  guardStatus: GuardStatus[];

  // Performance Metrics
  successRate: number;
  averageRewards: number;
  incidentRate: number;

  // Quick Actions
  assignTask: (taskId: string, stewardId: string) => void;
  hireGuard: (guardType: GuardType) => void;
  optimizeRoute: (routeId: string) => void;
}

```text

### Mobile Optimization

- **Simplified Interface**: Essential information only

- **Push Notifications**: Alerts for completed tasks and incidents

- **Quick Actions**: Common automation tasks with minimal taps

- **Offline Summary**: Clear summary of offline progress

### Desktop Features

- **Detailed Analytics**: Comprehensive performance metrics

- **Advanced Planning**: Route optimization tools

- **Bulk Operations**: Manage multiple contracts simultaneously

- **Historical Data**: Long-term performance tracking

## Acceptance Criteria

- [ ] Automation system provides meaningful progression without overshadowing combat

- [ ] Incident system causes downtime only, never permanent item loss

- [ ] Safety index provides clear risk/reward trade-offs

- [ ] Steward contracts offer strategic delegation choices

- [ ] Task board system provides engaging automation gameplay

- [ ] Route optimization adds strategic depth

- [ ] Performance budgets maintained under automation load

- [ ] Offline automation continues meaningful progress

- [ ] UI/UX supports both mobile and desktop automation management

- [ ] Pity system prevents frustration with task failures
