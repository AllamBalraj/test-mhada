import { ChevronRight, CreditCard, MapPin } from "lucide-react";

type StatusValue = "SUCCESS" | "PENDING" | "FAILED" | (string & {});

type BoardModel = {
  boardCode?: string;
  boardName?: string;
  organizationCode?: string;
};

export type Lottery = {
  key: number;
  lotteryCode: string;
  lotteryName: string;
  applicationFee: number;
  applicationStartDateLbl?: string;
  applicationStartDateStatus?: StatusValue;
  applicationEndDateLbl?: string;
  applicationEndDateStatus?: StatusValue;
  onlinePaymentEndDateLbl?: string;
  onlinePaymentEndDateStatus?: StatusValue;
  lotteryRunDateLbl?: string;
  lotteryRunDateStatus?: StatusValue;
  boardModel?: BoardModel;
  [k: string]: unknown;
};

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  SUCCESS: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    label: "Completed",
  },
  PENDING: {
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    label: "Upcoming",
  },
  FAILED: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    label: "Closed",
  },
};

const BOARD_COLORS: Record<string, string> = {
  MUMBAI: "from-blue-600 to-blue-800",
  PUNE: "from-purple-600 to-purple-800",
  KONKAN: "from-teal-600 to-teal-800",
  NASHIK: "from-green-600 to-green-800",
  DEFAULT: "from-orange-600 to-red-700",
};

type TimelineStepProps = {
  label: string;
  date?: string;
  status?: StatusValue;
};

function TimelineStep({ label, date, status }: TimelineStepProps): JSX.Element {
  const s = STATUS_STYLES[status ?? "PENDING"] || STATUS_STYLES.PENDING;
  return (
    <div className="flex items-start gap-2">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs font-semibold text-gray-700">{date ?? "—"}</p>
      </div>
    </div>
  );
}

type LotteryCardProps = {
  lottery: Lottery;
  onSelect: (lottery: Lottery) => void;
};

export default function LotteryCard({ lottery, onSelect }: LotteryCardProps): JSX.Element {
  const gradientClass = BOARD_COLORS[lottery.boardModel?.boardCode ?? "DEFAULT"] || BOARD_COLORS.DEFAULT;
  const isOpen = lottery.applicationStartDateStatus === "SUCCESS" && lottery.applicationEndDateStatus === "PENDING";

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(lottery)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(lottery);
      }}
    >
      {/* Card header */}
      <div className={`bg-gradient-to-r ${gradientClass} p-5 relative overflow-hidden`}>
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -right-2 w-16 h-16 bg-white/10 rounded-full" />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {lottery.boardModel?.boardName ?? "Board"} Board
            </span>
            {isOpen ? (
              <span className="flex items-center gap-1 bg-green-400/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Open Now
              </span>
            ) : (
              <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                Opening Soon
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-lg leading-snug pr-2">{lottery.lotteryName}</h3>
          <p className="text-white/70 text-xs mt-1 font-mono">{lottery.lotteryCode}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-4">
        {/* Fee */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-500">
            <CreditCard size={15} />
            <span className="text-sm">Application Fee</span>
          </div>
          <span className="font-bold text-gray-900 text-base">
            ₹{lottery.applicationFee.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Key dates */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Dates</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <TimelineStep label="Apply From" date={lottery.applicationStartDateLbl} status={lottery.applicationStartDateStatus} />
            <TimelineStep label="Apply Till" date={lottery.applicationEndDateLbl} status={lottery.applicationEndDateStatus} />
            <TimelineStep label="Payment End" date={lottery.onlinePaymentEndDateLbl} status={lottery.onlinePaymentEndDateStatus} />
            <TimelineStep label="Lottery Date" date={lottery.lotteryRunDateLbl} status={lottery.lotteryRunDateStatus} />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={12} />
            <span>{lottery.boardModel?.organizationCode ?? "MHADA"}</span>
          </div>
          <button type="button" className="flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:gap-2 transition-all">
            View Schemes
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
