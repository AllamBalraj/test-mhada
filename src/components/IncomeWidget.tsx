import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Info } from "lucide-react";
import { useIncome } from "../context/IncomeContext";

type IncomeStore = {
  amount: number; // annual amount
  percent: number; // affordability percent (0..1)
  tenure: number; // loan tenure in years
  roi: number; // rate of interest (annual %), default 8
  downPayment: number; // down payment percentage, default 20
  savedAt: number;
};

export interface IncomeModalHandle {
  openModal: () => void;
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

const IncomeWidget = forwardRef<IncomeModalHandle>(function IncomeWidget(_, ref) {
  const { income, setIncome } = useIncome();
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [percent, setPercent] = useState(0.35);
  const [tenure, setTenure] = useState(20); // default 20 years
  const [roi, setRoi] = useState(8); // default 8% interest rate
  const [downPayment, setDownPayment] = useState(20); // default 20% down payment
  const [error, setError] = useState<string | null>(null);
  const [showAffordabilityTooltip, setShowAffordabilityTooltip] = useState(false);

  useEffect(() => {
    if (income) {
      setInput(String(Math.round(income.amount)));
      setPercent(income.percent ?? 0.35);
      setTenure(income.tenure ?? 20);
      setRoi(income.roi ?? 8);
      setDownPayment(income.downPayment ?? 20);
    }
  }, [income]);

  const monthly = () => (Number(input.replace(/[^\d]/g, "")) || income?.amount || 0) / 12;
  const emi = () => Math.round(monthly() * percent);

  function openModal() {
    setError(null);
    setShowModal(true);
  }

  // Expose openModal via forwardRef for external access
  useImperativeHandle(ref, () => ({
    openModal,
  }), []);

  function save() {
    const numeric = Number(String(input).replace(/[^\d]/g, ""));
    const MAX_INCOME = 100000000; // 10 crore
    const MIN_INCOME = 100000; // 1 lakh

    if (!numeric) {
      setError("Please enter your annual income.");
      return;
    }
    if (numeric < MIN_INCOME) {
      setError(`Annual income must be at least ₹${formatCurrency(MIN_INCOME)}.`);
      return;
    }
    if (numeric > MAX_INCOME) {
      setError(`Annual income cannot exceed ₹${formatCurrency(MAX_INCOME)}.`);
      return;
    }
    const payload: IncomeStore = { amount: numeric, percent, tenure, roi, downPayment, savedAt: Date.now() };
    setIncome(payload);
    setShowModal(false);
  }

  function clearStored() {
    setIncome(null);
    setInput("");
    setPercent(0.35);
    setTenure(20);
    setRoi(8);
    setDownPayment(20);
    setShowModal(false);
  }

  function applyPreset(n: number) {
    setInput(String(n));
    setError(null);
  }

  return (
    <>
      {showModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md bg-white rounded-lg p-6 shadow-2xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-100">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Estimate your monthly EMI</h3>
              <button aria-label="Close" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual income (INR)</label>
              <input
                inputMode="numeric"
                aria-label="Annual income"
                value={input}
                onChange={(e) => {
                  const only = e.target.value.replace(/[^\d]/g, "");
                  const numeric = Number(only);
                  const MAX_INCOME = 100000000; // 10 crore
                  
                  // Only allow numbers up to max income
                  if (only === "" || numeric <= MAX_INCOME) {
                    setInput(only);
                    setError(null);
                  } else {
                    setError(`Annual income cannot exceed ₹${formatCurrency(MAX_INCOME)}.`);
                  }
                }}
                placeholder="600000"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 align-items-center">
                  <label className="text-sm font-medium text-gray-700">Affordability % ({Math.round(percent * 100)}%)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowAffordabilityTooltip(true)}
                      onMouseLeave={() => setShowAffordabilityTooltip(false)}
                      onClick={() => setShowAffordabilityTooltip(!showAffordabilityTooltip)}
                      className="text-gray-400 hover:text-orange-600 transition"
                      aria-label="Affordability help"
                    >
                      <Info size={16} />
                    </button>
                    {showAffordabilityTooltip && (
                      <div className="absolute left-0 top-6 w-48 bg-gray-900 text-white text-xs rounded-md p-2 shadow-lg z-10 pointer-events-none">
                        <p>The percentage of your monthly income recommended for EMI payments. For example, at 35%, if your monthly income is ₹50,000, your affordable EMI is ₹17,500.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={30}
                max={50}
                value={Math.round(percent * 100)}
                onChange={(e) => setPercent(Number(e.target.value) / 100)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Loan Tenure ({tenure} years)</label>
              </div>
              <input
                type="range"
                min={15}
                max={25}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>15 years</span>
                <span>25 years</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Rate of Interest ({roi.toFixed(1)}% p.a.)</label>
              </div>
              <input
                type="range"
                min={5}
                max={12}
                step={0.1}
                value={roi}
                onChange={(e) => setRoi(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5%</span>
                <span>12%</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Down Payment ({downPayment}%)</label>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="mb-4">
                <div className="text-sm bg-orange-50 border border-orange-200 p-3 rounded mt-3">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-700">Monthly income: <span className="font-semibold">{formatCurrency(monthly())}</span></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-gray-700">Your EMI Budget: <span className="font-semibold text-orange-600">{formatCurrency(emi())}</span>/mo</div>
                      <button 
                        onClick={() => {
                          setShowModal(false);
                          window.dispatchEvent(new CustomEvent('open-feedback', { detail: { improve: 'Bug Report' } }));
                        }}
                        className="text-red-600 font-bold text-sm hover:text-red-700 transition cursor-pointer"
                      >
                        Found an Issue?
                      </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-md font-medium transition shadow-sm">Save</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition">Cancel</button>
            </div>

            {income && (
              <button onClick={clearStored} className="w-full mt-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium text-sm transition">Clear saved data</button>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">Stored locally on this device only. This is an estimate for guidance only.</p>
          </div>
        </div>
      )}
    </>
  );
});

IncomeWidget.displayName = "IncomeWidget";

export default IncomeWidget;
