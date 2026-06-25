import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2, "required").max(120),
  email: z.string().trim().email("invalidEmail").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(20, "minMessage").max(3000),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

export function formatContactErrors(
  error: z.ZodError,
  labels: { required: string; invalidEmail: string; minMessage: string },
): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (formatted[key]) continue;

    if (issue.message === "required") formatted[key] = labels.required;
    else if (issue.message === "invalidEmail") formatted[key] = labels.invalidEmail;
    else if (issue.message === "minMessage") formatted[key] = labels.minMessage;
    else formatted[key] = issue.message;
  }

  return formatted;
}
