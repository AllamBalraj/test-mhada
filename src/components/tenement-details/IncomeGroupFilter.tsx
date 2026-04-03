type IncomeGroupFilterProps = {
  groups: string[];
  selected: string;
  counts: Record<string, number>;
  onSelect: (group: string) => void;
};

export default function IncomeGroupFilter({
  groups,
  selected,
  counts,
  onSelect,
}: IncomeGroupFilterProps): JSX.Element {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {groups.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onSelect(g)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selected === g ? "bg-orange-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {g}
          {g !== "All" && counts[g] ? (
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                selected === g ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {counts[g]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
