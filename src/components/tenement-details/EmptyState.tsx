import { Home } from "lucide-react";

type EmptyStateProps = {
  onClear: () => void;
};

export default function EmptyState({ onClear }: EmptyStateProps): JSX.Element {
  return (
    <div className="text-center py-24 text-gray-400">
      <Home size={48} className="mx-auto mb-3 opacity-30" />
      <p className="text-lg font-medium text-gray-500">No schemes found</p>
      <p className="text-sm mt-1">Try adjusting your search or income group filter</p>
      <button type="button" onClick={onClear} className="mt-4 text-sm text-orange-600 font-medium hover:underline">
        Clear all filters
      </button>
    </div>
  );
}
