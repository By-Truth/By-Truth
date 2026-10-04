import { createFormHandler } from "@/lib/forms/handler";
import { validateContact } from "@/lib/forms/validation";

export const POST = createFormHandler({
  name: "contact",
  successMessage: "Thank you for getting in touch. A member of our team will respond as soon as possible.",
  validate: validateContact,
  toSubmission: (data) => ({
    kind: "contact",
    subject: `Website enquiry — ${data.subject}`,
    replyTo: data.email,
    fields: [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone || "Not provided"],
      ["Subject", data.subject],
      ["Message", data.message],
    ],
  }),
});
