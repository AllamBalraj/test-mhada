import { useMemo, useRef, useState } from "react";
import { type Lottery } from "../components/LotteryCard";
import Navbar from "../components/Navbar";
import Seo from "../components/seo/Seo";
import { useActiveLottery } from "../hooks/useActiveLottery";
import useSchemesForLotteries from "../hooks/useSchemesForLotteries";
import StatusTimeline from "../components/StatusTimeline";
import SchemeCard, { Scheme } from "../components/SchemeCard";
import { schemeDetails } from "../data/schemes";
import { formatSchemeFields } from "../utils/formatScheme";
import SearchBar from "../components/tenement-details/SearchBar";
import IncomeGroupFilter from "../components/tenement-details/IncomeGroupFilter";
import SchemeGrid from "../components/tenement-details/SchemeGrid";
import EmptyState from "../components/tenement-details/EmptyState";

const INCOME_GROUPS = ["All", "EWS", "LIG", "MIG", "HIG"];

type TenementDetailsPageProps = {
  lottery: Lottery;
  onBack: () => void;
};

export default function TenementDetailsPage({ lottery }: TenementDetailsPageProps): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [incomeFilter, setIncomeFilter] = useState<string>("All");
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const searchDebounceTimerRef = useRef<number | null>(null);

  const apiLottery = useActiveLottery(lottery.lotteryCode);
  const apiSchemes = useSchemesForLotteries([501, 502, 503, 504]);

  const timelineLottery = apiLottery ?? lottery;

  const localData = (schemeDetails as Record<string, { schemeList: Scheme[] } | undefined>)[lottery.lotteryCode];
  const localSchemes: Scheme[] = localData?.schemeList ?? [];

  const schemes: Scheme[] = useMemo(() => {
    const fromApi = apiSchemes ?? [];
    return fromApi.length ? fromApi : localSchemes;
  }, [apiSchemes, localSchemes]);

  const filtered = useMemo((): Scheme[] => {
    const q = search.trim().toLowerCase();

    return schemes.filter((s: Scheme) => {
      const matchSearch =
        !q ||
        s.schemeName.toLowerCase().includes(q) ||
        s.schemeCode.toLowerCase().includes(q) ||
        s.taluka.toLowerCase().includes(q);

      const matchIncome = incomeFilter === "All" || s.incomeGroupCode === incomeFilter;
      return matchSearch && matchIncome;
    });
  }, [schemes, search, incomeFilter]);

  const isApiLoading = apiSchemes == null;
  const isLoading = isApiLoading || isFiltering;

  const incomeGroupCounts = useMemo(() => {
    return schemes.reduce<Record<string, number>>((acc, s: Scheme) => {
      acc[s.incomeGroupCode] = (acc[s.incomeGroupCode] || 0) + 1;
      return acc;
    }, {});
  }, [schemes]);

  const handleChangeSearch = (value: string) => {
    setSearchInput(value);

    if (searchDebounceTimerRef.current) {
      window.clearTimeout(searchDebounceTimerRef.current);
    }

    setIsFiltering(true);
    searchDebounceTimerRef.current = window.setTimeout(() => {
      setSearch(value);
      setIsFiltering(false);
    }, 250);
  };

  const handleIncomeFilter = (value: string) => {
    setIsFiltering(true);
    setIncomeFilter(value);
    requestAnimationFrame(() => setIsFiltering(false));
  };

  const uiFiltered = useMemo(() => {
    return filtered.map((scheme) => ({
      scheme,
      formatted: formatSchemeFields(scheme as unknown as Record<string, unknown>),
    }));
  }, [filtered]);

  const handleViewInMhadaWebsite = (scheme: Scheme) => {
    const lotteryId = Number((scheme as any).lotteryId);
    const key = String((scheme as any).key ?? "");

    if (!Number.isFinite(lotteryId) || !key) return;

    const url = `https://housing.mhada.gov.in/pre-lottery/scheme-detail/1/${lotteryId}/${key}/VIEW`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const seoTitle = "MHADA Lottery Mumbai (2026) | Mumbai MHADA Lottery Schemes";
  const seoDescription =
    "MHADA Lottery Mumbai 2026: search MHADA schemes in Mumbai by location and income group (EWS/LIG/MIG/HIG). View carpet area, cost, EMD, and latest updates.";

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/"
        keywords={["Mhada lottery", "Mumbai Mhada Lottery", "Mhada Mumbai 2026", "MHADA lottery Mumbai"]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: seoTitle,
            description: seoDescription,
            url: "https://housingmhada.in/",
          },
        ]}
      />

      <Navbar />

      <div className="bg-white border-b border-gray-100 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="w-full overflow-x-auto">
            <StatusTimeline lottery={timelineLottery} />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-12 sm:top-8 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full sm:max-w-sm">
            <SearchBar value={searchInput} onChange={handleChangeSearch} />
          </div>

          <IncomeGroupFilter
            groups={INCOME_GROUPS}
            selected={incomeFilter}
            counts={incomeGroupCounts}
            onSelect={handleIncomeFilter}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <SchemeGrid mode="loading" />
        ) : filtered.length === 0 ? (
          <EmptyState
            onClear={() => {
              handleChangeSearch("");
              handleIncomeFilter("All");
            }}
          />
        ) : (
          <SchemeGrid mode="data">
            {uiFiltered.map(({ scheme, formatted }) => (
              <SchemeCard key={scheme.key} scheme={scheme} formatted={formatted} onApply={handleViewInMhadaWebsite} />
            ))}
          </SchemeGrid>
        )}
      </div>
    </div>
  );
}
