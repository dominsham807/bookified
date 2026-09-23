import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "@/lib/constants";

export const pdfFileSchema = z
  .instanceof(File, { message: "PDF File is required" })
  .refine(
    (file) => ACCEPTED_PDF_TYPES.includes(file.type),
    "Please upload a PDF file.",
  )
  .refine((file) => file.size <= MAX_FILE_SIZE, "PDF must be 50 MB or smaller.");

export const coverImageSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.size <= MAX_IMAGE_SIZE,
    "Cover image must be 10 MB or smaller.",
  )
  .refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Cover image must be a JPEG, PNG, or WebP file.",
  );

export const UploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  author: z
    .string()
    .min(1, "Author name is required")
    .max(100, "Author name is too long"),
  persona: z.string().min(1, "Please select a voice"),
  pdfFile: pdfFileSchema,
  coverImage: coverImageSchema,
});
