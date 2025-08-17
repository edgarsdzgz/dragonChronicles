// Principal Engineer Implementation - Enchant costs per Spec §12.2

const BASE_COST = { firepower: 10, scales: 12 };

export function levelCost(kind: 'firepower' | 'scales', nextLevel: number): number {
	return Math.ceil(BASE_COST[kind] * Math.pow(1.4, nextLevel - 1));
}

export function tierUpCost(kind: 'firepower' | 'scales', tier: 1 | 2 | 3): number {
	const last = tier === 1 ? 50 : tier === 2 ? 200 : 500;
	return 3 * levelCost(kind, last);
}

// Spec §12.3 - Tier math helpers
export function tierBounds(tier: 1 | 2 | 3): [number, number] { 
	return tier === 1 ? [1, 50] : tier === 2 ? [51, 200] : [201, 500]; 
}

export function tierProgress(current: number, tier: 1 | 2 | 3): number {
	const [lo, hi] = tierBounds(tier);
	const clamped = Math.max(lo, Math.min(current, hi));
	return (clamped - lo + (current >= lo ? 1 : 0)) / (hi - lo + 1);
}