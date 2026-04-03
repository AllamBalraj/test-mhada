import { useEffect, useState } from "react";
import { type Lottery } from "../components/LotteryCard";

export function useActiveLottery(lotteryCode: string): Lottery | null {
  const [apiLottery, setApiLottery] = useState<Lottery | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLottery = async () => {
      try {
        const url = "https://appro.mhada.gov.in/guest/fetch-active-lotteries";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch lotteries");

        const data = (await res.json()) as unknown;
        const raw = (data ?? {}) as { lotteries?: Lottery[] } | Lottery[];
        const list: Lottery[] = Array.isArray(raw) ? raw : (raw.lotteries ?? []);

        const first = list[0] ?? null;
        if (!cancelled) setApiLottery(first);
      } catch {
        if (!cancelled) setApiLottery(null);
      }
    };

    fetchLottery();
    return () => {
      cancelled = true;
    };
  }, []);

  return apiLottery;
}

export default useActiveLottery;
