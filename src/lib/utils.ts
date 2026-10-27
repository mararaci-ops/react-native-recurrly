const utcDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const formatUtcDate = (date?: Date): string => {
  if (!date || Number.isNaN(date.getTime())) return "Not provided";
  return utcDateFormatter.format(date);
};

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatoMoneda = (
  value: number,
  currency: "USD" | "EUR",
  locale = "es-ES",
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  return formatUtcDate(new Date(value));
};

export const formatoFechaString = (value?: string): string => {
  if (!value) return "Not provided";
  return formatUtcDate(new Date(value));
};

export const formatoFecha = (date?: Date): string => {
  return formatUtcDate(date);
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
