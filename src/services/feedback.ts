type SubmitFeedbackInput = {
  name: string;
  email: string;
  improve: string;
  feedback: string;
  pageUrl?: string;
  userAgent?: string;
};

const FEEDBACK_ENDPOINT = (import.meta as any).env?.VITE_FEEDBACK_ENDPOINT as string | undefined;

function buildPayload(input: SubmitFeedbackInput) {
  return {
    ...input,
    submittedAt: new Date().toISOString(),
  };
}

function postViaHiddenForm(endpoint: string, payload: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const iframe = document.createElement("iframe");
      iframe.name = `feedback_iframe_${Date.now()}`;
      iframe.style.display = "none";

      const form = document.createElement("form");
      form.method = "POST";
      form.action = endpoint;
      form.target = iframe.name;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "payload";
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(iframe);
      document.body.appendChild(form);

      // We can't reliably read the cross-origin response; resolve optimistically.
      const cleanup = () => {
        form.remove();
        iframe.remove();
      };

      iframe.onload = () => {
        cleanup();
        resolve();
      };

      form.submit();

      // Fallback timeout in case onload doesn't fire (some browsers)
      window.setTimeout(() => {
        if (document.body.contains(form) || document.body.contains(iframe)) {
          cleanup();
          resolve();
        }
      }, 2500);
    } catch (e) {
      reject(e);
    }
  });
}

export async function submitFeedback(input: SubmitFeedbackInput): Promise<void> {
  if (!FEEDBACK_ENDPOINT) {
    throw new Error("Feedback endpoint is not configured.");
  }

  const payload = buildPayload(input);

  try {
    // Primary attempt: fetch (may still fail with "Failed to fetch" if browser blocks reading response)
    const res = await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    // If we got here, request was sent and response is readable.
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Failed to submit feedback.");
    }

    return;
  } catch {
    // Fallback: cross-origin form POST (no CORS read required). Data still reaches Apps Script.
    await postViaHiddenForm(FEEDBACK_ENDPOINT, payload);
  }
}
