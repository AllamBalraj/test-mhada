import type { Scheme } from "../components/SchemeCard";

type SchemeDetails = {
  errorMessage: string | null;
  status: "SUCCESS" | "FAILED" | "PENDING" | (string & {});
  schemeList: Scheme[];
};

export const schemeDetails: Record<string, SchemeDetails> = {
  // ...existing code...
};