export function formatAmount(amount: number, type?: string) {
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (type) {
    return type === "credit" ? `+${fmt}` : `-${fmt}`;
  }
  return fmt;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
