const inr = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// Money arrives from the API as a string (e.g. "16000.00"). Formatting is the client's job:
// INR, en-IN grouping, "₹ " prefix. Returns null when there is no price to show.
export function formatINR(amount) {
  if (amount === null || amount === undefined || amount === "") return null;
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  return `₹ ${inr.format(value)}`;
}
