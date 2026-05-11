import { useMemo, useRef, useState } from "react";
import { Calculator } from "lucide-react";
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
import IncomeWidget, { type IncomeModalHandle } from "../components/IncomeWidget";

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
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    // Check localStorage to see if user has dismissed the banner
    try {
      return localStorage.getItem("emi-banner-dismissed") === "true";
    } catch {
      return false;
    }
  });
  const searchDebounceTimerRef = useRef<number | null>(null);
  const incomeModalRef = useRef<IncomeModalHandle>(null);

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
            url: "https://www.housingmhada.in/",
          },
        ]}
      />

      <IncomeWidget ref={incomeModalRef} />

      <Navbar />

      <div className="bg-white border-b border-gray-100 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="w-full overflow-x-auto">
            <StatusTimeline lottery={timelineLottery} />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-12 sm:top-8 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Mobile layout: search + button on same row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 w-full sm:max-w-sm flex gap-2">
              <div className="flex-1">
                <SearchBar value={searchInput} onChange={handleChangeSearch} />
              </div>
              {/* Calculate EMI button - visible on mobile, beside search */}
              <button
                onClick={() => incomeModalRef.current?.openModal()}
                className="sm:hidden flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-semibold transition-all shadow-sm flex-shrink-0 relative group"
                type="button"
                aria-label="Calculate EMI"
              >
                <div className="absolute inset-0 bg-orange-400 rounded-lg opacity-0 group-hover:opacity-20 animate-pulse transition-opacity" />
                <Calculator size={18} className="relative z-10" />
                {/* Attention pulse ring */}
                <div className="absolute -inset-2 bg-orange-400 rounded-lg opacity-0 group-hover:opacity-10 animate-ping" />
              </button>
            </div>

            {/* Web layout: filters + button */}
            <div className="hidden sm:flex gap-2 items-center">
              <IncomeGroupFilter
                groups={INCOME_GROUPS}
                selected={incomeFilter}
                counts={incomeGroupCounts}
                onSelect={handleIncomeFilter}
              />
              {/* Calculate EMI button - hidden on mobile */}
              <button
                onClick={() => incomeModalRef.current?.openModal()}
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex-shrink-0 relative group overflow-hidden"
                type="button"
                aria-label="Calculate EMI"
              >
                {/* Background pulse effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 animate-pulse" />
                {/* Content */}
                <Calculator size={16} className="relative z-10" />
                <span className="relative z-10">Calculate EMI</span>
                {/* Attention indicator pulse ring */}
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse opacity-70" />
              </button>
            </div>
          </div>

          {/* Mobile filters - below search */}
          <div className="sm:hidden mt-3">
            <IncomeGroupFilter
              groups={INCOME_GROUPS}
              selected={incomeFilter}
              counts={incomeGroupCounts}
              onSelect={handleIncomeFilter}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* First-time User EMI Banner */}
        {/* {!bannerDismissed && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg border border-orange-400 animate-pulse-slow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💡</span>
                  <h3 className="font-bold text-base md:text-lg">Calculate Your EMI & Compare</h3>
                </div>
                <p className="text-sm md:text-base opacity-95 leading-relaxed">
                  Set your annual income to instantly see the estimated monthly EMI for each scheme and check if it fits your budget. Make informed decisions faster!
                </p>
                <button
                  onClick={() => {
                    incomeModalRef.current?.openModal();
                  }}
                  className="mt-3 inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  <Calculator size={16} />
                  Get Started Now
                </button>
              </div>
              <button
                onClick={() => {
                  setBannerDismissed(true);
                  try {
                    localStorage.setItem("emi-banner-dismissed", "true");
                  } catch {
                    // Ignore localStorage errors
                  }
                }}
                className="flex-shrink-0 text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                aria-label="Close banner"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )} */}

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
              <SchemeCard
                key={scheme.key}
                scheme={scheme}
                formatted={formatted}
                onApply={handleViewInMhadaWebsite}
                onOpenIncomeModal={() => incomeModalRef.current?.openModal()}
              />
            ))}
          </SchemeGrid>
        )}
      </div>
    </div>
  );
}
