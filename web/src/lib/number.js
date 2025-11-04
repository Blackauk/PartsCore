export const formatQuantity = (n) => new Intl.NumberFormat().format(n);
export const formatDelta = (d) => (d>0?`+${d}`:`${d}`);

export default { formatQuantity, formatDelta };


