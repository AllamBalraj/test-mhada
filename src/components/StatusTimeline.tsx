import { CheckCircle, Clock } from "lucide-react";
import { type Lottery } from "./LotteryCard";

// Narrow the keys we need from Lottery to safely index into it.
type StatusTimelineKey =
  | "applicationStartDateStatus"
  | "applicationEndDateStatus"
  | "onlinePaymentEndDateStatus"
  | "draftPublishApplicationDateStatus"
  | "finalPublishApplicationDateStatus"
  | "lotteryRunDateStatus"
  | "refundStartDateStatus";

type StatusTimelineDateKey =
  | "applicationStartDateLbl"
  | "applicationEndDateLbl"
  | "onlinePaymentEndDateLbl"
  | "draftPublishApplicationDateLbl"
  | "finalPublishApplicationDateLbl"
  | "lotteryRunDateLbl"
  | "refundStartDateLbl";

type StatusStep = {
  key: StatusTimelineKey;
  label: string;
  dateKey: StatusTimelineDateKey;
};

const STATUS_STEPS: StatusStep[] = [
  { key: "applicationStartDateStatus", label: "Applications Open", dateKey: "applicationStartDateLbl" },
  { key: "applicationEndDateStatus", label: "Applications Close", dateKey: "applicationEndDateLbl" },
  { key: "onlinePaymentEndDateStatus", label: "Payment Deadline", dateKey: "onlinePaymentEndDateLbl" },
  {
    key: "draftPublishApplicationDateStatus",
    label: "Draft Published",
    dateKey: "draftPublishApplicationDateLbl",
  },
  { key: "finalPublishApplicationDateStatus", label: "Final List", dateKey: "finalPublishApplicationDateLbl" },
  { key: "lotteryRunDateStatus", label: "Lottery Draw", dateKey: "lotteryRunDateLbl" },
  { key: "refundStartDateStatus", label: "Refunds Start", dateKey: "refundStartDateLbl" },
];

type StatusTimelineProps = {
  lottery: Lottery;
};

export default function StatusTimeline({ lottery }: StatusTimelineProps): JSX.Element {
  // Some Lottery typings may not include all API fields; safely treat as a partial map for this view.
  const timelineData = lottery as unknown as Partial<Record<StatusTimelineKey | StatusTimelineDateKey, string>>;

  const completedCount = STATUS_STEPS.reduce((acc, step) => acc + (timelineData[step.key] === "SUCCESS" ? 1 : 0), 0);

  return (
    <div className="relative">
      {/* Mobile: accordion */}
      <div className="sm:hidden">
        <details className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <summary className="list-none cursor-pointer select-none px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Progress</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {completedCount} of {STATUS_STEPS.length} completed
              </p>
            </div>
            <span className="text-xs font-medium text-gray-400">Tap to view</span>
          </summary>

          <div className="px-4 pb-4">
            <div className="mt-2 space-y-3">
              {STATUS_STEPS.map((step) => {
                const status = timelineData[step.key];
                const date = timelineData[step.dateKey];
                const isSuccess = status === "SUCCESS";

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative
                        ${isSuccess ? "bg-green-500 border-green-500" : "bg-white border-gray-200"}`}
                    >
                      {isSuccess ? <CheckCircle size={14} className="text-white" /> : <Clock size={12} className="text-gray-300" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight ${isSuccess ? "text-green-700" : "text-gray-700"}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSuccess ? "text-green-600" : "text-gray-400"}`}>{date || "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      </div>

      {/* sm+: keep existing horizontal timeline */}
      <div className="hidden sm:block">
        <div className="flex items-start gap-0">
          {STATUS_STEPS.map((step, i) => {
            const status = timelineData[step.key];
            const date = timelineData[step.dateKey];
            const isSuccess = status === "SUCCESS";
            const isLast = i === STATUS_STEPS.length - 1;

            return (
              <div key={step.key} className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 relative
                    ${isSuccess ? "bg-green-500 border-green-500" : "bg-white border-gray-200"}`}
                  >
                    {isSuccess ? (
                      <>
                        <span className="absolute inset-0 rounded-full animate-ping bg-green-400/20" aria-hidden="true" />
                        <span
                          className="absolute w-2.5 h-2.5 rounded-full bg-green-200/90 animate-pulse"
                          aria-hidden="true"
                        />
                        <CheckCircle size={14} className="text-white relative z-10" />
                      </>
                    ) : (
                      <Clock size={12} className="text-gray-300" />
                    )}
                  </div>
                  {!isLast && <div className={`flex-1 h-0.5 ${isSuccess ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
                <div className="mt-2 pr-1">
                  <p className={`text-xs font-medium leading-tight ${isSuccess ? "text-green-700" : "text-gray-500"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSuccess ? "text-green-600" : "text-gray-400"}`}>{date || "—"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
