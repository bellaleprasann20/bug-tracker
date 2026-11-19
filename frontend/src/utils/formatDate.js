
const DEFAULT_LOCALE = "en-IN";

const isValidDate = (date) => {
  if (!date) return false;

  const parsedDate = new Date(date);

  return !Number.isNaN(parsedDate.getTime());
};

export function formatDate(date, options = {}) {
  if (!isValidDate(date)) return "—";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!isValidDate(date)) return "—";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatTime(date) {
  if (!isValidDate(date)) return "—";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  if (!isValidDate(date)) return "—";

  const timestamp = new Date(date).getTime();
  const difference = timestamp - Date.now();

  const seconds = Math.round(difference / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const formatter = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, {
    numeric: "auto",
  });

  if (Math.abs(seconds) < 60) {
    return formatter.format(seconds, "second");
  }

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  if (Math.abs(days) < 30) {
    return formatter.format(days, "day");
  }

  return formatDate(date);
}

export function formatDateForInput(date) {
  if (!isValidDate(date)) return "";

  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isOverdue(date) {
  if (!isValidDate(date)) return false;

  const dueDate = new Date(date);
  dueDate.setHours(23, 59, 59, 999);

  return dueDate.getTime() < Date.now();
}
