import dayjs from 'dayjs';

export function daysOverdue(expectedISO) {
  const today = dayjs();
  const expected = dayjs(expectedISO);
  return Math.max(0, today.diff(expected, 'day'));
}

export function formatTime(ts = new Date()) {
  return dayjs(ts).format('HH:mm:ss');
}

export default { daysOverdue, formatTime };


