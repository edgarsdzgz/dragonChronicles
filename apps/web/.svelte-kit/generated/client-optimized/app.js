export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/dev/boom": [3],
		"/dev/dragon-animated": [5],
		"/dev/dragon-debug": [6],
		"/dev/dragon-final": [7],
		"/dev/dragon-simple": [8],
		"/dev/dragon-working": [9],
		"/dev/dragon": [4],
		"/dev/logs": [10],
		"/dev/pool": [11]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';