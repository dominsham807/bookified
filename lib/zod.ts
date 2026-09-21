import { z } from "zod";

const fileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Please select a file.",
);

export const UploadSchema = z.object({
  pdfFile: fileSchema
    .refine((file) => file.type === "application/pdf", "Please select a PDF file.")
    .refine((file) => file.size <= 50 * 1024 * 1024, "PDF must be smaller than 50MB."),
  coverImage: fileSchema
    .refine((file) => file.type.startsWith("image/"), "Cover must be an image.")
    .optional(),
  title: z.string().trim().min(1, "Title is required."),
  author: z.string().trim().min(1, "Author name is required."),
  voice: z.string().min(1, "Choose an assistant voice."),
});
