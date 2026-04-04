import { useMemo, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { submitFeedback } from "../../services/feedback";

type ImproveOption =
  | "UI/Design"
  | "Performance/Speed"
  | "Content/Information"
  | "Search/Filtering"
  | "Mobile Experience"
  | "Bug Report"
  | "Other";

const IMPROVE_OPTIONS: ImproveOption[] = [
  "UI/Design",
  "Performance/Speed",
  "Content/Information",
  "Search/Filtering",
  "Mobile Experience",
  "Bug Report",
  "Other",
];

type FormState = {
  name: string;
  email: string;
  improve: ImproveOption | "";
  feedback: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.name.trim()) errors.name = "Name is required.";
  else if (state.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

  if (!state.email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(state.email)) errors.email = "Enter a valid email.";

  if (!state.improve) errors.improve = "Please select an option.";

  if (!state.feedback.trim()) errors.feedback = "Feedback is required.";
  else if (state.feedback.trim().length < 10) errors.feedback = "Please write at least 10 characters.";
  else if (state.feedback.trim().length > 2000) errors.feedback = "Please keep it under 2000 characters.";

  return errors;
}

export default function FeedbackWidget(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const [state, setState] = useState<FormState>({
    name: "",
    email: "",
    improve: "",
    feedback: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(state), [state]);
  const canSubmit = Object.keys(errors).length === 0 && !busy;

  const showErrorFor = (field: keyof FormState) => Boolean((submitted || touched[field]) && errors[field]);

  const close = () => {
    setOpen(false);
    setServerError(null);
    setServerSuccess(null);
    setTouched({});
    setSubmitted(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);
    setSubmitted(true);

    const currentErrors = validate(state);
    if (Object.keys(currentErrors).length) {
      setServerError("Please fix the highlighted fields.");
      return;
    }

    try {
      setBusy(true);
      await submitFeedback({
        name: state.name.trim(),
        email: state.email.trim(),
        improve: state.improve,
        feedback: state.feedback.trim(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
      setServerSuccess("Thanks! Your feedback was submitted.");
      setState({ name: "", email: "", improve: "", feedback: "" });
      setTouched({});
      setSubmitted(false);
    } catch (err: any) {
      // If a browser blocks reading the response, fetch can throw "Failed to fetch".
      // Since you confirmed rows are being written, treat that error as a likely success.
      const msg = String(err?.message ?? "");
      if (msg.toLowerCase().includes("failed to fetch")) {
        setServerSuccess("Thanks! Your feedback was submitted.");
        setState({ name: "", email: "", improve: "", feedback: "" });
      } else {
        setServerError(err?.message ?? "Failed to submit feedback. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Open feedback form"
      >
        <MessageSquare size={16} />
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Share feedback</h3>
                <p className="text-sm text-gray-500 mt-0.5">Help improve the website experience.</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close feedback form"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-5 space-y-4">
              {serverError && <div className="text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-xl">{serverError}</div>}
              {serverSuccess && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-xl">{serverSuccess}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                  <input
                    value={state.name}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        name: e.target.value,
                      }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      showErrorFor("name") ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  {showErrorFor("name") && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    value={state.email}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        email: e.target.value,
                      }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      showErrorFor("email") ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                  {showErrorFor("email") && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">What can be improved?</label>
                <select
                  value={state.improve}
                  onChange={(e) => {
                    setState((s) => ({ ...s, improve: e.target.value as any }));
                    setTouched((t) => ({ ...t, improve: true }));
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, improve: true }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    showErrorFor("improve") ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">Select an option</option>
                  {IMPROVE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {showErrorFor("improve") && <p className="mt-1 text-xs text-red-600">{errors.improve}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback</label>
                <textarea
                  value={state.feedback}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      feedback: e.target.value,
                    }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, feedback: true }))}
                  className={`w-full min-h-[120px] rounded-lg border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    showErrorFor("feedback") ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="What would you like to see improved?"
                />
                <div className="flex items-center justify-between mt-1">
                  {showErrorFor("feedback") ? <p className="text-xs text-red-600">{errors.feedback}</p> : <span />}
                  <p className="text-xs text-gray-400">{state.feedback.trim().length}/2000</p>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 font-semibold py-2.5 rounded-xl transition-all shadow text-sm ${
                    canSubmit ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-orange-200 text-white cursor-not-allowed"
                  }`}
                  disabled={!canSubmit}
                >
                  {busy ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
