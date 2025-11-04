import { create } from 'zustand';
import { ROLE_PERMISSION_MAP } from '../constants/permissions.js';

export const useAuthStore = create((set, get) => ({
	currentUser: {
		id: 'U-001',
		name: 'Demo Admin',
		email: 'admin@example.com',
		role: localStorage.getItem('dev_role') || 'Admin',
		sites: ['AR','VRCB'],
		activeSite: localStorage.getItem('active_site') || 'AR',
		prefs: {
			theme: localStorage.getItem('theme') || 'dark',
			locale: localStorage.getItem('locale') || 'en-GB',
			tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
			notify: {
				lowStock: true,
				grn: true,
				po: true,
			},
			status: 'Online',
			recent: [],
		},
	},
	sites: [
		{ code: 'AR', name: 'Atlas Road' },
		{ code: 'VRCB', name: 'VRCB' },
		{ code: 'WR', name: 'West Ruislip' },
		{ code: 'FI', name: 'Flat Iron' },
		{ code: 'AY', name: 'Atlas Yard' },
		{ code: 'DS', name: 'Depot South' },
	],
	sessions: [
		{ id: 'S-1', device: 'Windows', browser: 'Chrome', ip: '192.168.1.10', lastActive: 'Just now', location: 'Office' },
		{ id: 'S-2', device: 'iPhone', browser: 'Safari', ip: '10.0.0.5', lastActive: '2h ago', location: 'Mobile' },
	],
	tokens: [
		{ id: 'T-1', label: 'PowerBI', tokenLast4: '7F3A', createdAt: '2025-09-01', lastUsedAt: '2025-10-20' },
	],
	_twoFAEnabled: false,
	setRole: (role) => set((state) => {
		localStorage.setItem('dev_role', role);
		if (!state.currentUser) return {};
		return { currentUser: { ...state.currentUser, role } };
	}),
	setActiveSite: (site) => set((state) => {
		localStorage.setItem('active_site', site);
		if (!state.currentUser) return {};
		return { currentUser: { ...state.currentUser, activeSite: site } };
	}),
	setPrefs: (partial) => set((state) => {
		if (!state.currentUser) return {};
		const next = { ...state.currentUser.prefs, ...partial, notify: { ...state.currentUser.prefs.notify, ...(partial?.notify || {}) } };
		if (partial?.theme) {
			localStorage.setItem('theme', partial.theme);
			const isDark = partial.theme === 'dark' || (partial.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
			document.documentElement.classList.toggle('dark', isDark);
		}
		if (partial?.locale) localStorage.setItem('locale', partial.locale);
		return { currentUser: { ...state.currentUser, prefs: next } };
	}),
	updateProfile: (partial) => set((state) => {
		if (!state.currentUser) return {};
		return { currentUser: { ...state.currentUser, ...partial } };
	}),
	changePassword: (oldPw, nextPw) => {
		// mock; in real app call API
		console.log('changePassword', { oldPw, nextPw });
		return true;
	},
	toggle2FA: () => set((state) => ({ _twoFAEnabled: !state._twoFAEnabled })),
	addRecent: (item) => set((state) => {
		if (!state.currentUser) return {};
		const prev = state.currentUser.prefs.recent || [];
		const recent = [item, ...prev].filter((v, i, a) => a.findIndex(x => x.href === v.href) === i).slice(0, 5);
		return { currentUser: { ...state.currentUser, prefs: { ...state.currentUser.prefs, recent } } };
	}),
	createToken: (label) => set((state) => {
		const id = `T-${Math.floor(Math.random()*9000+1000)}`;
		const tokenLast4 = Math.random().toString(16).slice(-4).toUpperCase();
		const now = new Date().toISOString().slice(0,10);
		return { tokens: [{ id, label, tokenLast4, createdAt: now, lastUsedAt: now }, ...state.tokens] };
	}),
	revokeToken: (id) => set((state) => ({ tokens: state.tokens.filter(t => t.id !== id) })),
	signOutSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) })),
	signOutAll: () => set(() => ({ sessions: [] })),
	revokeAllSessions: () => set(() => ({ sessions: [] })),
	signOut: () => set(() => ({ currentUser: null })),
	can: (permission) => {
		const role = get().currentUser?.role;
		// First check localStorage for updated permissions
		try {
			const stored = localStorage.getItem('role-permissions');
			if (stored) {
				const parsed = JSON.parse(stored);
				const rolePerms = parsed[role] || [];
				if (rolePerms.includes(permission)) return true;
			}
		} catch (e) {
			console.error('Failed to check permissions', e);
		}
		// Fallback to legacy ROLE_PERMISSION_MAP
		const allowed = ROLE_PERMISSION_MAP[role] || [];
		return allowed.includes(permission);
	}
}));




