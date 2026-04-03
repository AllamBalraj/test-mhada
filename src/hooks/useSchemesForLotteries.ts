import { useEffect, useMemo, useState } from "react";
import { type Scheme } from "../components/SchemeCard";

type ApiShape =
  | { schemeList?: Scheme[]; data?: { schemeList?: Scheme[] } }
  | Record<string, { schemeList?: Scheme[]; data?: { schemeList?: Scheme[] } }>;

function extractSchemes(payload: unknown): Scheme[] {
  const root = (payload ?? {}) as ApiShape;

  // direct `{ schemeList }` or `{ data: { schemeList } }`
  if (typeof root === "object" && root && "schemeList" in root) {
    const direct = root as { schemeList?: Scheme[]; data?: { schemeList?: Scheme[] } };
    if (direct.schemeList?.length) return direct.schemeList;
    if (direct.data?.schemeList?.length) return direct.data.schemeList;
  }

  // `{ SOME_CODE: { schemeList } }`
  if (typeof root === "object" && root) {
    return Object.values(root as Record<string, unknown>).flatMap((v) => {
      const obj = (v ?? {}) as { schemeList?: Scheme[]; data?: { schemeList?: Scheme[] } };
      return obj.schemeList ?? obj.data?.schemeList ?? [];
    });
  }

  return [];
}

export function useSchemesForLotteries(lotteryIds: number[]): Scheme[] | null {
  const [apiSchemes, setApiSchemes] = useState<Scheme[] | null>(null);

  const lotteryKey = useMemo(() => [...lotteryIds].sort((a, b) => a - b).join(","), [lotteryIds]);

  const urls = useMemo(() => {
    const ids = lotteryKey ? lotteryKey.split(",").map((s) => Number(s)).filter(Number.isFinite) : [];
    return ids.map((id) => `https://appro.mhada.gov.in/guest/apply/lottery/${id}`);
  }, [lotteryKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchSchemes = async () => {
      try {
        const responses = await Promise.all(urls.map((u) => fetch(u)));
        responses.forEach((r) => {
          if (!r.ok) throw new Error("Failed to fetch schemes");
        });

        const json = (await Promise.all(responses.map((r) => r.json()))) as unknown[];

        const combined = json.flatMap((payload, idx) => {
          const url = urls[idx] ?? "";
          const lastSegment = url.split("/").filter(Boolean).pop() ?? "";
          const lotteryId = Number(lastSegment);

          const schemes = extractSchemes(payload);

          // Add the id used in the URL to each scheme object.
          return schemes.map((s) => ({
            ...(s as Scheme),
            lotteryId: Number.isFinite(lotteryId) ? lotteryId : undefined,
          })) as Scheme[];
        });
        console.log('combined', combined);

        if (!cancelled) setApiSchemes(combined);
      } catch {
        if (!cancelled) setApiSchemes(null);
      }
    };

    if (urls.length === 0) {
      setApiSchemes([]);
      return () => {
        cancelled = true;
      };
    }

    fetchSchemes();
    return () => {
      cancelled = true;
    };
  }, [urls]);

  return apiSchemes;
}

export default useSchemesForLotteries;
