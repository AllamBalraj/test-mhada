import { ArrowRight, Home, XCircle } from "lucide-react";
import { formatSchemeFields } from "../utils/formatScheme";

export type Scheme = {
  key: number;
  schemeCode: string;
  schemeName: string;
  incomeGroupCode: "EWS" | "LIG" | "MIG" | "HIG" | (string & {});
  incomeGroupName: string;
  emdAmount: number;
  taluka: string;
  builtupArea?: string;
  builtupAreaUnit?: string;
  carpetArea?: string;
  carpetAreaUnit?: string;
  cost: string;
  isPmay?: "Y" | "N" | string;
  reraRegistrationNo?: string | null;
  tenements: number;
  categoryCodes: string[];
  canApplyForScheme: boolean;
  canNotApplyForSchemeReason?: string;
  [k: string]: unknown;
};

type SchemeCardProps = {
  scheme: Scheme;
  onApply?: (scheme: Scheme) => void;
  formatted?: {
    carpetAreaText?: string;
    builtupAreaText?: string;
    costText?: string;
    emdText?: string;
    reraText?: string;
  };
};

const INCOME_GROUP_COLORS = {
  EWS: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  LIG: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  MIG: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  HIG: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
};

const CATEGORY_LABELS = {
  SC: "Scheduled Caste",
  ST: "Scheduled Tribe",
  NT: "Nomadic Tribe",
  DT: "De-notified Tribe",
  JR: "Journalist",
  FF: "Freedom Fighter",
  PH: "Physically Handicapped",
  DF: "Defence",
  EX: "Ex-Serviceman",
  "MP/MLA/MLC": "MP / MLA / MLC",
  ME: "MHADA Employee",
  SG: "State Govt. Employee",
  CG: "Central Govt. Employee",
  AR: "Architect",
  GP: "General Public",
};

const SQMT_TO_SQFT = 10.763910416709722;

function formatHyphenated(value: unknown, formatOne: (part: string) => string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "NA";

  // normalize common separators and allow spacing around '-'
  const parts = raw.split(/\s*-\s*/g).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return formatOne(raw);

  return parts.map((p) => formatOne(p)).join(" - ");
}

function toSqftString(areaSqm: unknown): string {
  return formatHyphenated(areaSqm, (part) => {
    const n = Number(part);
    if (!Number.isFinite(n)) return "NA";
    return `${(n * SQMT_TO_SQFT).toFixed(0)} sq.ft`;
  });
}

function formatCostFromRaw(costRaw: unknown): string {
  return formatHyphenated(costRaw, (part) => {
    const rupees = Number(part);
    if (!Number.isFinite(rupees)) return "NA";

    const lakhs = rupees / 100000;
    if (lakhs < 100) return `₹${lakhs.toFixed(2)}L`;

    const crores = lakhs / 100;
    return `₹${crores.toFixed(2)}Cr`;
  });
}

function formatEmd(emdRaw: unknown): string {
  return formatHyphenated(emdRaw, (part) => {
    const rupees = Number(part);
    if (!Number.isFinite(rupees)) return "NA";

    if (rupees < 100000) return `₹${rupees.toLocaleString("en-IN")}`;

    const lakhs = rupees / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  });
}

function formatRera(rera: unknown): string {
  const s = String(rera ?? "").trim();
  return s ? s : "NA";
}

export default function SchemeCard({ scheme, onApply, formatted }: SchemeCardProps): JSX.Element {
  const incomeStyle =
    INCOME_GROUP_COLORS[(scheme.incomeGroupCode as keyof typeof INCOME_GROUP_COLORS)] || INCOME_GROUP_COLORS.MIG;
  const canApply = scheme.canApplyForScheme;

  const fallback = formatSchemeFields(scheme as unknown as Record<string, unknown>);

  const costText = formatted?.costText ?? fallback.costText;
  const emdText = formatted?.emdText ?? fallback.emdText;
  const carpetAreaText = formatted?.carpetAreaText ?? fallback.carpetAreaText;
  const builtupAreaText = formatted?.builtupAreaText ?? fallback.builtupAreaText;
  const reraText = formatted?.reraText ?? fallback.reraText;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Color band */}
      <div className={`h-1.5 w-full ${incomeStyle.dot}`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${incomeStyle.bg} ${incomeStyle.text} ${incomeStyle.border}`}>
                {scheme.incomeGroupName}
              </span>
              {scheme.isPmay === "Y" && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  PMAY
                </span>
              )}
              <span className="text-xs text-gray-400 font-mono">#{scheme.schemeCode}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
              {scheme.schemeName}
            </h3>
          </div>
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${incomeStyle.bg}`}>
            <Home size={18} className={incomeStyle.text} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Cost</p>
            <p className="text-base font-bold text-gray-900">{costText}</p>
            <p className="text-xs text-gray-400">EMD: {emdText}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Tenements</p>
            <p className="text-base font-bold text-gray-900">{scheme.tenements}</p>
            <p className="text-xs text-gray-400">Available units</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Carpet Area</p>
            <p className="text-sm font-bold text-gray-900">{carpetAreaText}</p>
            <p className="text-xs text-gray-400">Built-up: {builtupAreaText}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Location</p>
            <p className="text-sm font-bold text-gray-900 truncate">{scheme.taluka}</p>
            <p className="text-xs text-gray-400 truncate">RERA: {reraText}</p>
          </div>
        </div>

        {/* Categories */}
        {/* <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category Reservations</p>
          <div className="flex flex-wrap gap-1.5">
            {scheme.categoryCodes.slice(0, 8).map((code) => (
              <span
                key={code}
                title={CATEGORY_LABELS[code] || code}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors cursor-default"
              >
                {code}
              </span>
            ))}
            {scheme.categoryCodes.length > 8 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                +{scheme.categoryCodes.length - 8} more
              </span>
            )}
          </div>
        </div> */}

        {/* Action */}
        {/* <div className="pt-1 border-t border-gray-100">
          {canApply ? (
            <button
              onClick={() => onApply?.(scheme)}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm group-hover:shadow"
            >
              View in Mhada Website
              <ArrowRight size={15} />
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 text-sm font-medium py-2.5 rounded-xl cursor-not-allowed">
              <XCircle size={15} />
              {scheme.canNotApplyForSchemeReason || "Not Applicable"}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}
