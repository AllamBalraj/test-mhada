const SQMT_TO_SQFT = 10.763910416709722;

export function toSqftString(areaSqm: unknown): string {
  const n = typeof areaSqm === "number" ? areaSqm : Number(areaSqm);
  if (!Number.isFinite(n)) return "NA";
  return `${(n * SQMT_TO_SQFT).toFixed(0)} sq.ft`;
}

function formatHyphenated(value: unknown, formatOne: (part: string) => string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "NA";

  const parts = raw.split(/\s*-\s*/g).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return formatOne(raw);

  return parts.map((p) => formatOne(p)).join(" - ");
}

export function formatCostFromRaw(costRaw: unknown): string {
  return formatHyphenated(costRaw, (part) => {
    const rupees = Number(part);
    if (!Number.isFinite(rupees)) return "NA";

    const lakhs = rupees / 100000;
    if (lakhs < 100) return `₹${lakhs.toFixed(2)}L`;

    const crores = lakhs / 100;
    return `₹${crores.toFixed(2)}Cr`;
  });
}

export function formatEmd(emdRaw: unknown): string {
  return formatHyphenated(emdRaw, (part) => {
    const rupees = Number(part);
    if (!Number.isFinite(rupees)) return "NA";

    if (rupees < 100000) return `₹${rupees.toLocaleString("en-IN")}`;

    const lakhs = rupees / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  });
}

export function formatRera(rera: unknown): string {
  const s = String(rera ?? "").trim();
  return s ? s : "NA";
}

export type SchemeFormattedFields = {
  carpetAreaText: string;
  builtupAreaText: string;
  costText: string;
  emdText: string;
  reraText: string;
};

export function formatSchemeFields(scheme: Record<string, unknown>): SchemeFormattedFields {
  return {
    carpetAreaText: toSqftString(scheme.carpetArea),
    builtupAreaText: toSqftString(scheme.builtupArea),
    costText: formatCostFromRaw(scheme.cost),
    emdText: formatEmd(scheme.emdAmount),
    reraText: formatRera(scheme.reraRegistrationNo ?? scheme.reraNumber),
  };
}
