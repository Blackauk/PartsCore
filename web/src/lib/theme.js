export function setTheme(theme) {
	localStorage.setItem('theme', theme);
	const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', isDark);
}

export function getTheme() {
	return localStorage.getItem('theme') || 'auto';
}
