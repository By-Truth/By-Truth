"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldErrors, ValidationResult } from "@/lib/forms/validation";

export type FormStatus = "idle" | "submitting" | "success" | "error";

interface Options<T> {
  endpoint: string;
  validate: (values: Record<string, unknown>) => ValidationResult<T>;
}

interface ServerResponse {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
}

/**
 * Handles the client side of a protected form submission:
 * fetches a signed form token, validates locally, posts JSON with the token
 * header and maps server responses into UI state.
 */
export function useProtectedForm<T>({ endpoint, validate }: Options<T>) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [tokenReady, setTokenReady] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const loadToken = useCallback(async () => {
    try {
      const response = await fetch("/api/form-token", { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { token?: string };
      tokenRef.current = data.token ?? null;
      setTokenReady(Boolean(data.token));
    } catch {
      tokenRef.current = null;
      setTokenReady(false);
    }
  }, []);

  useEffect(() => {
    // Fetching the token on mount is the intended external synchronisation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadToken();
  }, [loadToken]);

  const clearFieldError = useCallback((field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const submit = useCallback(
    async (form: HTMLFormElement) => {
      const formData = new FormData(form);
      const values: Record<string, unknown> = Object.fromEntries(formData.entries());
      // Unchecked checkboxes are absent from FormData.
      form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
        values[input.name] = input.checked;
      });

      const result = validate(values);
      if (!result.success) {
        setErrors(result.errors);
        setStatus("error");
        setMessage("Please correct the highlighted fields.");
        return;
      }

      if (!tokenRef.current) await loadToken();
      if (!tokenRef.current) {
        setStatus("error");
        setMessage("We could not prepare the form. Please refresh the page or contact us by phone or email.");
        return;
      }

      setStatus("submitting");
      setMessage("");
      setErrors({});

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", "X-Form-Token": tokenRef.current },
          body: JSON.stringify(values),
        });
        const data = (await response.json().catch(() => null)) as ServerResponse | null;

        if (response.ok && data?.ok) {
          setStatus("success");
          setMessage(data.message);
          form.reset();
          tokenRef.current = null;
          void loadToken();
          return;
        }

        setStatus("error");
        setErrors(data?.errors ?? {});
        setMessage(data?.message ?? "Something went wrong. Please try again.");
        // Expired or rejected tokens are replaced so the visitor can simply resubmit.
        if (response.status === 403) void loadToken();
      } catch {
        setStatus("error");
        setMessage("We could not reach the server. Please check your connection and try again.");
      }
    },
    [endpoint, validate, loadToken],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage("");
    setErrors({});
  }, []);

  return { status, message, errors, tokenReady, submit, clearFieldError, reset };
}
