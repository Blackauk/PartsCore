export function isEmail(value) {
	return /.+@.+\..+/.test(String(value || ''));
}

export function passwordStrength(pw) {
	const s = String(pw || '');
	let score = 0;
	if (s.length >= 8) score++;
	if (s.length >= 12) score++;
	if (/[A-Z]/.test(s)) score++;
	if (/[a-z]/.test(s)) score++;
	if (/[0-9]/.test(s)) score++;
	if (/[^A-Za-z0-9]/.test(s)) score++;
	const label = score >= 5 ? 'Strong' : score >= 3 ? 'Medium' : 'Weak';
	return { score, label };
}
