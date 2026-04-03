import type { ReactNode } from "react";

type SchemeGridProps =
  | {
      mode: "loading";
    }
  | {
      mode: "data";
      children: ReactNode;
    };

export default function SchemeGrid(props: SchemeGridProps): JSX.Element {
  if (props.mode === "loading") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-3" />
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
              <div className="h-9 w-24 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{props.children}</div>;
}
