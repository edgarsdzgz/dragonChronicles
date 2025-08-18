// Principal Engineer Implementation - Distance formatting per Spec §12.1

const landName = 'Verdant Dragonplains';

function km2(m: number): number { 
	return (m / 1000); 
}

export function formatKm2(m: number): string {
	return km2(m).toLocaleString(undefined, { 
		minimumFractionDigits: 2, 
		maximumFractionDigits: 2 
	}) + ' km';
}

export function formatDistanceHeader(currentLevel: number, runTotalDistanceMeters: number): string {
	return `Land ${currentLevel} | ${landName} ${formatKm2(runTotalDistanceMeters)}`;
}