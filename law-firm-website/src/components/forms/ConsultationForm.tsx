"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, type FormEvent } from "react";
import {
  CONSULTATION_METHODS,
  LIMITS,
  todayInLagos,
  validateConsultation,
  type SelectOption,
} from "@/lib/forms/validation";
import { buttonClasses } from "@/components/ui/Button";
import { CheckboxField, Honeypot, SelectField, TextareaField, TextField } from "./fields";
import { FormError, FormSuccess, PrivacyNotice } from "./FormFeedback";
import { useProtectedForm } from "./useProtectedForm";

export function ConsultationForm({ matterOptions }: { matterOptions: SelectOption[] }) {
  const validate = useCallback(
    (values: Record<string, unknown>) =>
      validateConsultation(
        values,
        matterOptions.map((option) => option.value),
      ),
    [matterOptions],
  );
  const { status, message, errors, tokenReady, submit, clearFieldError, reset } = useProtectedForm({
    endpoint: "/api/consultation",
    validate,
  });
  const dateRef = useRef<HTMLInputElement>(null);

  // The page is statically generated, so "today" is set in the browser.
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayInLagos();
  }, [status]);

  if (status === "success") {
    return (
      <FormSuccess
        title="Request received"
        message={message}
        onReset={reset}
        resetLabel="Submit another request"
      />
    );
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(event.currentTarget);
  };
  const clear = (field: string) => () => clearFieldError(field);
  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={submitting} className="relative space-y-7">
      <PrivacyNotice>
        <strong className="font-semibold text-navy">
          Please do not submit confidential or highly sensitive information through this form.
        </strong>{" "}
        Submitting a request does not create a lawyer–client relationship. We will discuss the details of your matter
        with you directly.
      </PrivacyNotice>

      <div className="grid gap-7 sm:grid-cols-2">
        <TextField
          name="fullName"
          label="Full Name"
          autoComplete="name"
          required
          maxLength={LIMITS.name.max}
          error={errors.fullName}
          onChange={clear("fullName")}
          className="sm:col-span-2"
        />
        <TextField
          name="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={LIMITS.email.max}
          error={errors.email}
          onChange={clear("email")}
        />
        <TextField
          name="phone"
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          maxLength={LIMITS.phone.max}
          placeholder="+234"
          error={errors.phone}
          onChange={clear("phone")}
        />
        <SelectField
          name="practiceArea"
          label="Legal Matter / Practice Area"
          required
          options={matterOptions}
          error={errors.practiceArea}
          onChange={clear("practiceArea")}
          className="sm:col-span-2"
        />
        <TextField
          ref={dateRef}
          name="preferredDate"
          label="Preferred Consultation Date"
          type="date"
          required
          error={errors.preferredDate}
          hint="We will confirm the exact date and time with you."
          onChange={clear("preferredDate")}
        />
        <SelectField
          name="consultationMethod"
          label="Preferred Consultation Method"
          required
          options={CONSULTATION_METHODS}
          error={errors.consultationMethod}
          onChange={clear("consultationMethod")}
        />
        <TextareaField
          name="description"
          label="Brief Description"
          required
          minLength={LIMITS.description.min}
          maxLength={LIMITS.description.max}
          hint="A short, general outline is enough — please leave out confidential details."
          error={errors.description}
          onChange={clear("description")}
          className="sm:col-span-2"
        />
      </div>

      <CheckboxField
        name="consent"
        error={errors.consent}
        onChange={clear("consent")}
        label={
          <>
            I understand that this form is not for confidential information and I agree to my details being used to
            respond to my request, as described in the{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-gold-deep">
              Privacy Policy
            </Link>
            .
          </>
        }
      />

      <Honeypot />
      <FormError status={status} message={message} />

      <button type="submit" disabled={submitting || !tokenReady} className={buttonClasses("navy", "w-full sm:w-auto")}>
        {submitting ? "Submitting…" : !tokenReady ? "Preparing form…" : "Submit Consultation Request"}
      </button>
    </form>
  );
}
