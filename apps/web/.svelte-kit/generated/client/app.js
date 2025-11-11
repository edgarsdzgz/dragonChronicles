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
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16')
];

export const server_loads = [];

export const dictionary = {
		"/": [3],
		"/dev/boom": [4,[2]],
		"/dev/currency-topbar": [5,[2]],
		"/dev/dragon-animated": [7,[2]],
		"/dev/dragon-debug": [8,[2]],
		"/dev/dragon-final": [9,[2]],
		"/dev/dragon-simple": [10,[2]],
		"/dev/dragon-working": [11,[2]],
		"/dev/dragon": [6,[2]],
		"/dev/logo-spinner": [12,[2]],
		"/dev/logs": [13,[2]],
		"/dev/pool": [14,[2]],
		"/dev/profile-shapes": [15,[2]],
		"/dev/protoprofile": [16,[2]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';