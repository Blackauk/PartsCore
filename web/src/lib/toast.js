export function toast(message) {
	try {
		const evt = new CustomEvent('app:toast', { detail: { message } });
		document.dispatchEvent(evt);
	} catch (e) {
		// no-op
	}
	if (typeof window !== 'undefined') {
		// fallback simple toast
		// eslint-disable-next-line no-alert
		alert(message);
	}
}
