import { ArrowRight, Home, XCircle, TrendingDown, AlertCircle } from "lucide-react";
import { formatSchemeFields } from "../utils/formatScheme";
import { useIncome } from "../context/IncomeContext";
import React from "react";

// Tax deduction calculation for income > 12 lakh (New Income Tax Regime)
function calculateTaxAdjustedIncome(annualIncome: number): number {
  // For income > 12 lakh, apply standard deduction and other deductions
  // Standard deduction: ₹50,000
  // Assuming basic deductions for housing loan: ~₹1,50,000 (approximate)
  if (annualIncome > 1200000) {
    const deductions = 50000 + 150000; // Standard + housing
    return Math.max(annualIncome - deductions, annualIncome);
  }
  return annualIncome;
}

// Proper EMI calculation using compound interest formula
// EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
// P = Principal (loan amount after down payment)
// r = Monthly interest rate (annual ROI / 12 / 100)
// n = Number of months
function calculateEMIWithInterest(
  principalInRupees: number,
  annualROI: number,
  tenureInYears: number
): number {
  if (principalInRupees <= 0 || annualROI < 0 || tenureInYears <= 0) return 0;

  const monthlyRate = annualROI / 12 / 100;
  const numberOfMonths = tenureInYears * 12;

  // Handle 0% interest case
  if (monthlyRate === 0) {
    return Math.round(principalInRupees / numberOfMonths);
  }

  // Compound interest EMI formula
  const numerator = principalInRupees * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths);
  const denominator = Math.pow(1 + monthlyRate, numberOfMonths) - 1;
  return Math.round(numerator / denominator);
}

function calculateEMI(
  costStr: string,
  income: { amount: number; percent: number; tenure: number; roi: number; downPayment: number } | null
): number | null {
  if (!income) return null;

  // Extract numeric cost from "₹25L" or "₹1.5Cr" format
  const cleanCost = costStr.replace(/[^0-9.]/g, "");
  let costInRupees = Number(cleanCost);

  if (!Number.isFinite(costInRupees)) return null;

  // Handle Lakh (L) and Crore (Cr) suffixes
  if (costStr.includes("L")) costInRupees *= 100000;
  if (costStr.includes("Cr")) costInRupees *= 10000000;

  // Calculate principal after down payment
  const downPaymentAmount = (costInRupees * income.downPayment) / 100;
  const loanAmount = costInRupees - downPaymentAmount;

  // Calculate EMI with proper interest formula
  return calculateEMIWithInterest(loanAmount, income.roi, income.tenure);
}

function calculateEMIRange(
  costStr: string,
  income: { amount: number; percent: number; tenure: number; roi: number; downPayment: number } | null
): { min: number; max: number } | null {
  if (!income) return null;

  // Check if cost is a range (e.g., "₹75.37L - ₹84.68L")
  if (!costStr.includes("-")) {
    const emi = calculateEMI(costStr, income);
    return emi ? { min: emi, max: emi } : null;
  }

  // Split the range
  const parts = costStr.split("-").map((s) => s.trim());
  if (parts.length !== 2) {
    const emi = calculateEMI(costStr, income);
    return emi ? { min: emi, max: emi } : null;
  }

  const minCost = calculateEMI(parts[0], income);
  const maxCost = calculateEMI(parts[1], income);

  if (minCost === null || maxCost === null) return null;

  return {
    min: Math.min(minCost, maxCost),
    max: Math.max(minCost, maxCost),
  };
}

// Helper function to extract cost in rupees from cost string
function extractCostInRupees(costStr: string): number {
  if (!costStr) return 0;
  
  // Handle range (e.g., "₹75.37L - ₹84.68L") - use the first value
  if (costStr.includes("-")) {
    costStr = costStr.split("-")[0].trim();
  }
  
  // Extract all numbers and dots
  const cleanCost = costStr.match(/[\d.]+/)?.[0] ?? "";
  let costInRupees = Number(cleanCost);

  if (!Number.isFinite(costInRupees) || costInRupees === 0) return 0;

  // Handle Lakh (L) and Crore (Cr) suffixes - check original string
  if (costStr.toUpperCase().includes("CR")) {
    costInRupees *= 10000000; // Crore
  } else if (costStr.toUpperCase().includes("L")) {
    costInRupees *= 100000; // Lakh
  }

  return Math.round(costInRupees);
}

// Helper function to extract min and max costs from a range
function extractCostRange(costStr: string): { min: number; max: number } {
  if (!costStr) return { min: 0, max: 0 };
  
  // Check if it's a range
  if (costStr.includes("-")) {
    const parts = costStr.split("-").map(s => s.trim());
    const minCost = extractCostInRupees(parts[0]);
    const maxCost = extractCostInRupees(parts[1]);
    return {
      min: Math.min(minCost, maxCost),
      max: Math.max(minCost, maxCost),
    };
  }
  
  // Single value
  const singleCost = extractCostInRupees(costStr);
  return { min: singleCost, max: singleCost };
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString()}`;
  }
}

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

function formatUnknown(v: unknown): string {
  const s = String(v ?? "").trim();
  return s ? s : "NA";
}

function buildSchemeDetails(scheme: Scheme, fallback: ReturnType<typeof formatSchemeFields>) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Scheme Code", value: formatUnknown(scheme.schemeCode) },
    { label: "Income Group", value: formatUnknown(scheme.incomeGroupName || scheme.incomeGroupCode) },
    { label: "Taluka", value: formatUnknown(scheme.taluka) },
    { label: "Tenements", value: formatUnknown(scheme.tenements) },
    { label: "Cost", value: formatUnknown(fallback.costText) },
    { label: "EMD", value: formatUnknown(fallback.emdText) },
    { label: "Carpet Area", value: formatUnknown(fallback.carpetAreaText) },
    { label: "Built-up Area", value: formatUnknown(fallback.builtupAreaText) },
    { label: "RERA", value: formatUnknown(fallback.reraText) },
    { label: "PMAY", value: scheme.isPmay === "Y" ? "Yes" : "No" },
  ];

  // Add any extra raw fields that exist but aren't already covered above.
  const extraKeys = [
    "reraRegistrationNo",
    "emdAmount",
    "builtupArea",
    "builtupAreaUnit",
    "carpetArea",
    "carpetAreaUnit",
    "cost",
    "canApplyForScheme",
    "canNotApplyForSchemeReason",
  ];

  for (const k of extraKeys) {
    if (scheme[k] == null) continue;
    if (rows.some((r) => r.label.toLowerCase().replace(/\s+/g, "") === k.toLowerCase())) continue;
    rows.push({ label: k, value: formatUnknown(scheme[k]) });
  }

  return rows;
}

export default function SchemeCard({ scheme, onApply, formatted }: SchemeCardProps): JSX.Element {
  const { income } = useIncome();
  const incomeStyle =
    INCOME_GROUP_COLORS[(scheme.incomeGroupCode as keyof typeof INCOME_GROUP_COLORS)] || INCOME_GROUP_COLORS.MIG;
  const canApply = scheme.canApplyForScheme;

  const fallback = formatSchemeFields(scheme as unknown as Record<string, unknown>);

  const costText = formatted?.costText ?? fallback.costText;
  const emdText = formatted?.emdText ?? fallback.emdText;
  const carpetAreaText = formatted?.carpetAreaText ?? fallback.carpetAreaText;
  const builtupAreaText = formatted?.builtupAreaText ?? fallback.builtupAreaText;
  const reraText = formatted?.reraText ?? fallback.reraText;

  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const detailRows = React.useMemo(() => buildSchemeDetails(scheme, { ...fallback, costText, emdText, carpetAreaText, builtupAreaText, reraText }), [
    scheme,
    fallback,
    costText,
    emdText,
    carpetAreaText,
    builtupAreaText,
    reraText,
  ]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") open();
        }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      >
        {/* Color band */}
        <div className={`h-1.5 w-full ${incomeStyle.dot}`} />

        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${incomeStyle.bg} ${incomeStyle.text} ${incomeStyle.border}`}
                >
                  {scheme.incomeGroupName}
                </span>
                {scheme.isPmay === "Y" && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    PMAY
                  </span>
                )}
                <span className="text-xs text-gray-400 font-mono">#{scheme.schemeCode}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{scheme.schemeName}</h3>
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

          {/* View Details action with EMI */}
          {!isOpen && (
            <div className="pt-1 border-t border-gray-100">
              <div className="flex justify-between items-center gap-3">
                {/* EMI Display */}
                <div className="flex items-center gap-2">
                  {(() => {
                    if (!income) {
                      return (
                        <span className="text-xs text-gray-400">
                          Set income to see EMI
                        </span>
                      );
                    }
                    const emiRange = calculateEMIRange(costText, income);
                    if (!emiRange) return null;
                    
                    const userEMIBudget = Math.round((income.amount / 12) * income.percent);
                    const isAffordable = emiRange.min <= userEMIBudget;
                    const isTight = emiRange.max > userEMIBudget && emiRange.min <= userEMIBudget;
                    
                    const emiDisplay = emiRange.min === emiRange.max 
                      ? formatCurrency(emiRange.min)
                      : `${formatCurrency(emiRange.min)} - ${formatCurrency(emiRange.max)}`;
                    
                    return (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <TrendingDown size={14} className={isAffordable && !isTight ? "text-emerald-600" : "text-amber-600"} />
                          <span className={`text-xs font-medium ${isAffordable && !isTight ? "text-emerald-700" : "text-amber-700"}`}>
                            Est. EMI: {emiDisplay}/mo
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Your budget: {formatCurrency(userEMIBudget)}/mo
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* View Details Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Scheme details"
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  <h3 className="text-base font-semibold text-gray-900 leading-snug whitespace-normal break-words">
                    {scheme.schemeName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">{scheme.taluka}</p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600"
                  aria-label="Close"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
                {/* Affordability Comparison Section */}
                {(() => {
                  if (!income) {
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">Set Your Income</p>
                            <p className="text-xs text-blue-700 mt-1">Use the "Calculate EMI" button to set your annual income and see if you can afford this scheme.</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const emiRange = calculateEMIRange(costText, income);
                  if (!emiRange) return null;

                  const monthlyIncome = income.amount / 12;
                  const userEMIBudget = Math.round(monthlyIncome * income.percent);
                  const isAffordable = emiRange.min <= userEMIBudget;
                  const isTight = emiRange.max > userEMIBudget && emiRange.min <= userEMIBudget;
                  
                  const emiDisplay = emiRange.min === emiRange.max 
                    ? formatCurrency(emiRange.min)
                    : `${formatCurrency(emiRange.min)} - ${formatCurrency(emiRange.max)}`;

                  // Check if income is above 12 lakh for tax deduction info
                  const isTaxDeductible = income.amount > 1200000;

                  return (
                    <div className={`border rounded-xl p-4 ${isAffordable && !isTight ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Your Annual Income:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(income.amount)}</span>
                        </div>
                        {isTaxDeductible && (
                          <div className="flex justify-between items-center text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                            <span className="text-gray-600">💡 Tax eligible (&gt;₹12L)</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Monthly Income:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(Math.round(monthlyIncome))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Affordable EMI Budget ({income.percent * 100 | 0}%):</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(userEMIBudget)}/mo</span>
                        </div>
                        <div className="border-t border-gray-300 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Down Payment ({income.downPayment}%):</span>
                          <span className="text-xs text-gray-600">
                            {(() => {
                              const costRange = extractCostRange(costText);
                              const dpMin = Math.round((costRange.min * income.downPayment) / 100);
                              const dpMax = Math.round((costRange.max * income.downPayment) / 100);
                              
                              if (income.downPayment === 0) {
                                return "₹0 (included in EMI)";
                              }
                              
                              if (dpMin === dpMax) {
                                return formatCurrency(dpMin);
                              }
                              
                              return `${formatCurrency(dpMin)} - ${formatCurrency(dpMax)}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Interest Rate ({income.roi}% p.a.):</span>
                          <span className="text-xs text-gray-600">{income.tenure} years tenure</span>
                        </div>
                        <div className="border-t border-gray-300 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Scheme's Estimated EMI:</span>
                          <span className={`font-semibold ${isAffordable && !isTight ? "text-emerald-700" : "text-amber-700"}`}>
                            {emiDisplay}/mo
                          </span>
                        </div>
                        <div className="pt-2">
                          {isAffordable && !isTight ? (
                            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                              ✓ This scheme is within your budget
                            </p>
                          ) : isTight ? (
                            <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                              ⚠️ EMI range includes values above your budget. Check max EMI carefully.
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                              ⚠️ EMI is higher than your budget. Consider adjusting affordability % or increasing income.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Keep existing card details visible inside modal */}
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
                    <p className="text-xs text-gray-400 mb-0.5">RERA</p>
                    <p className="text-sm font-bold text-gray-900 break-all">{reraText}</p>
                    <p className="text-xs text-gray-400">PMAY: {scheme.isPmay === "Y" ? "Yes" : "No"}</p>
                  </div>
                </div>

                {/* <div className="bg-white rounded-xl border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Important details</p>
                  </div>
                  <dl className="divide-y divide-gray-100">
                    {detailRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-3 gap-3 px-4 py-3">
                        <dt className="text-xs font-medium text-gray-500">{row.label}</dt>
                        <dd className="col-span-2 text-sm text-gray-900 break-words">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div> */}

                {/* Optional: keep apply affordance stubbed if you later re-enable the button */}
                {typeof onApply === "function" && (
                  <div className="pt-1">
                    {canApply ? (
                      <button
                        onClick={() => onApply?.(scheme)}
                        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        Continue
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 text-sm font-medium py-2.5 rounded-xl cursor-not-allowed">
                        <XCircle size={15} />
                        {scheme.canNotApplyForSchemeReason || "Not Applicable"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
