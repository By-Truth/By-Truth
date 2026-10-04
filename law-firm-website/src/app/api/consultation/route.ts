import { getPracticeAreas } from "@/lib/content";
import { createFormHandler } from "@/lib/forms/handler";
import {
  CONSULTATION_METHODS,
  GENERAL_MATTER_OPTIONS,
  validateConsultation,
} from "@/lib/forms/validation";
import { formatDate } from "@/lib/utils";

async function matterOptions() {
  const areas = await getPracticeAreas();
  return [...areas.map((area) => ({ value: area.slug, label: area.name })), ...GENERAL_MATTER_OPTIONS];
}

export const POST = createFormHandler({
  name: "consultation",
  successMessage:
    "Thank you. Your consultation request has been received. A member of our team will contact you to confirm the details.",
  validate: async (input) => {
    const options = await matterOptions();
    return validateConsultation(
      input,
      options.map((option) => option.value),
    );
  },
  toSubmission: async (data) => {
    const options = await matterOptions();
    const matter = options.find((option) => option.value === data.practiceArea)?.label ?? data.practiceArea;
    const method =
      CONSULTATION_METHODS.find((option) => option.value === data.consultationMethod)?.label ??
      data.consultationMethod;
    return {
      kind: "consultation",
      subject: `Consultation request — ${data.fullName}`,
      replyTo: data.email,
      fields: [
        ["Full name", data.fullName],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Legal matter", matter],
        ["Preferred date", formatDate(data.preferredDate)],
        ["Preferred method", method],
        ["Brief description", data.description],
      ],
    };
  },
});
