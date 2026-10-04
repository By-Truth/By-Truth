"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { LIMITS, validateContact } from "@/lib/forms/validation";
import { buttonClasses } from "@/components/ui/Button";
import { CheckboxField, Honeypot, TextareaField, TextField } from "./fields";
import { FormError, FormSuccess, PrivacyNotice } from "./FormFeedback";
import { useProtectedForm } from "./useProtectedForm";

export function ContactForm() {
  const { status, message, errors, tokenReady, submit, clearFieldError, reset } = useProtectedForm({
    endpoint: "/api/contact",
    validate: validateContact,
  });

  if (status === "success") {
    return <FormSuccess title="Message sent" message={message} onReset={reset} resetLabel="Send another message" />;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(event.currentTarget);
  };
  const clear = (field: string) => () => clearFieldError(field);
  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} aria-busy={submitting} className="relative space-y-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <TextField
          name="name"
          label="Name"
          autoComplete="name"
          required
          maxLength={LIMITS.name.max}
          error={errors.name}
          onChange={clear("name")}
          className="sm:col-span-2"
        />
        <TextField
          name="email"
          label="Email"
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
          label="Phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          maxLength={LIMITS.phone.max}
          placeholder="+234"
          error={errors.phone}
          onChange={clear("phone")}
        />
        <TextField
          name="subject"
          label="Subject"
          required
          maxLength={LIMITS.subject.max}
          error={errors.subject}
          onChange={clear("subject")}
          className="sm:col-span-2"
        />
        <TextareaField
          name="message"
          label="Message"
          required
          minLength={LIMITS.message.min}
          maxLength={LIMITS.message.max}
          error={errors.message}
          onChange={clear("message")}
          className="sm:col-span-2"
        />
      </div>

      <PrivacyNotice>
        Please do not submit confidential or highly sensitive information through this form. Contacting us does not
        create a lawyer–client relationship.
      </PrivacyNotice>

      <CheckboxField
        name="consent"
        error={errors.consent}
        onChange={clear("consent")}
        label={
          <>
            I agree to my details being used to respond to my enquiry, as described in the{" "}
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
        {submitting ? "Sending…" : !tokenReady ? "Preparing form…" : "Send Message"}
      </button>
    </form>
  );
}
