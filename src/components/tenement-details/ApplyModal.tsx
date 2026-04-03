import { Info, X } from "lucide-react";
import type { Scheme } from "../SchemeCard";
import { formatCostFromRaw, formatEmd, formatRera, toSqftString } from "../../utils/formatScheme";

type ApplyModalProps = {
  scheme: Scheme;
  onClose: () => void;
};

export default function ApplyModal({ scheme, onClose }: ApplyModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Confirm Application</h3>
              <p className="text-sm text-gray-500 mt-0.5">Review details before applying</p>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Scheme</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%] leading-snug">#{scheme.schemeCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Income Group</span>
              <span className="font-semibold text-gray-800">{scheme.incomeGroupName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Carpet Area</span>
              <span className="font-semibold text-gray-800">{toSqftString((scheme as any).carpetArea)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Built-up Area</span>
              <span className="font-semibold text-gray-800">{toSqftString((scheme as any).builtupArea)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">RERA</span>
              <span className="font-semibold text-gray-800">{formatRera((scheme as any).reraRegistrationNo)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cost</span>
              <span className="font-semibold text-gray-800">{formatCostFromRaw((scheme as any).cost)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
              <span className="text-gray-500">EMD (Refundable)</span>
              <span className="font-bold text-orange-700">{formatEmd((scheme as any).emdAmount)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 mb-5">
            <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              EMD amount will be refunded within 30 days if not selected. Application fee is non-refundable.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                alert("Redirecting to application form…");
                onClose();
              }}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow text-sm"
            >
              Proceed to Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
