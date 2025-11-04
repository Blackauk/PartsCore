export function formatCurrency(n, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
}

export function formatNumber(n) {
  return new Intl.NumberFormat().format(n);
}

export function formatDate(d) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(d));
}


