"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Image, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadSchema } from "@/lib/zod";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { checkBookExists, createBook, saveBookSegments } from "@/lib/actions/book.actions";
import { parsePDFFile } from "@/lib/utils";
import { upload } from "@vercel/blob/client";

const voices = [
  { id: "dave", name: "Dave", description: "Warm and conversational", group: "Male Voices" },
  { id: "daniel", name: "Daniel", description: "Clear and thoughtful", group: "Male Voices" },
  { id: "chris", name: "Chris", description: "Friendly and energetic", group: "Male Voices" },
  { id: "rachel", name: "Rachel", description: "Calm and reassuring", group: "Female Voices" },
  { id: "sarah", name: "Sarah", description: "Bright and engaging", group: "Female Voices" },
];

type UploadFormValues = z.infer<typeof UploadSchema>;

const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { userId, getToken } = useAuth();
    
    const router = useRouter();

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: "",
      pdfFile: undefined,
      coverImage: undefined,
    },
  });

    const handleSubmit = async (data: UploadFormValues) => {
        if (!userId) {
            return toast.error("Please login to upload books");
        }
        setIsSubmitting(true);

        // PostHog -> Track Book Uploads...
        try {
            const existsCheck = await checkBookExists(data.title);

            if (existsCheck.exists && existsCheck.book) {
                toast.info('Book with same title already exists');
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, "-").toLowerCase();
            const pdfFile = data.pdfFile;
            const authToken = await getToken();

            if (!authToken) {
              throw new Error("Your session has expired. Please sign in again.");
            }

            const uploadHeaders = { Authorization: `Bearer ${authToken}` };

            const parsedPDF = await parsePDFFile(pdfFile);

            if (parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try again with a different file");
                return;
            }

            const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: 'application/pdf',
                headers: uploadHeaders,
            });

            let coverUrl: string;

            if (data.coverImage) {
                const coverFile = data.coverImage;
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: coverFile.type,
                    headers: uploadHeaders,
                });
                coverUrl = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsedPDF.cover);
                const blob = await response.blob();

                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: blob.type,
                    headers: uploadHeaders,
                });
                coverUrl = uploadedCoverBlob.url;
            }

            const book = await createBook({
              clerkId: userId,
              title: data.title,
              author: data.author,
              persona: data.persona,
              fileURL: uploadedPdfBlob.url,
              fileBlobKey: uploadedPdfBlob.pathname,
              coverURL: coverUrl,
              fileSize: pdfFile.size,
            });

            if (!book.success) throw new Error("Failed to create book");

            if (book.alreadyExists) {
                toast.info("Book with same title already exists");
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }

            const segments = await saveBookSegments(
              book.data._id,
              userId,
              parsedPDF.content,
            );

            if (!segments.success) {
              toast.error("Failed to save book segments");
              throw new Error("Failed to save book segments");
            }

            form.reset();
            router.push('/');
        } catch (error) {
            console.error(error);

            toast.error("Failed to upload book. Please try again");
        } finally {
            setIsSubmitting(false);
        }
    };

  const renderFileDropzone = (
    field: { value?: File; onChange: (file?: File) => void },
    inputRef: React.RefObject<HTMLInputElement | null>,
    accept: string,
    Icon: typeof FileText,
    text: string,
    hint: string,
    hideUploadedIcon = false,
  ) => (
    <div
      className={`upload-dropzone border-2 border-dashed border-[#d8c6a8] ${field.value ? "upload-dropzone-uploaded" : ""}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          if (!userId) {
            toast.error("Please sign in before uploading files");
            event.currentTarget.value = "";
            return;
          }

          field.onChange(event.target.files?.[0]);
        }}
      />
      {field.value ? (
        <>
          {!hideUploadedIcon && <Icon className="upload-dropzone-icon" />}
          <div className="flex items-center gap-2">
            <span className="upload-dropzone-text max-w-65 truncate">{field.value.name}</span>
            <button
              type="button"
              className="upload-dropzone-remove"
              aria-label={`Remove ${field.value.name}`}
              onClick={(event) => {
                event.stopPropagation();
                field.onChange(undefined);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <span className="upload-dropzone-hint">Click to replace file</span>
        </>
      ) : (
        <>
          <Icon className="upload-dropzone-icon" />
          <span className="upload-dropzone-text">{text}</span>
          <span className="upload-dropzone-hint">{hint}</span>
        </>
      )}
    </div>
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="new-book-wrapper space-y-8" noValidate>
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Upload Book PDF</FormLabel>
                <FormControl>{renderFileDropzone(field, pdfInputRef, "application/pdf", Upload, "Click to upload PDF", "PDF file (max 50MB)", true)}</FormControl>
                <FormMessage className="mt-2 text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                <FormControl>{renderFileDropzone(field, coverInputRef, "image/*", Image, "Click to upload cover image", "Leave empty to auto-generate from PDF", true)}</FormControl>
                <FormMessage className="mt-2 text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl><input className="form-input" placeholder="ex: Rich Dad Poor Dad" {...field} /></FormControl>
                <FormMessage className="mt-2 text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl><input className="form-input" placeholder="ex: Robert Kiyosaki" {...field} /></FormControl>
                <FormMessage className="mt-2 text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="persona"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                <FormControl>
                  <div className="space-y-5">
                    {["Male Voices", "Female Voices"].map((group) => (
                      <fieldset key={group}>
                        <legend className="mb-3 text-sm font-semibold text-(--text-secondary)">{group}</legend>
                        <div className="voice-selector-options flex-wrap">
                          {voices.filter((voice) => voice.group === group).map((voice) => (
                            <label key={voice.id} className={`voice-selector-option min-w-37.5 flex-col items-start gap-1 ${field.value === voice.id ? "voice-selector-option-selected" : "voice-selector-option-default"}`}>
                              <input type="radio" value={voice.id} checked={field.value === voice.id} onChange={() => field.onChange(voice.id)} className="sr-only" />
                              <span className="font-semibold text-(--text-primary)">{voice.name}</span>
                              <span className="text-sm text-(--text-secondary)">{voice.description}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </FormControl>
                <FormMessage className="mt-2 text-sm text-red-600" />
              </FormItem>
            )}
          />

          <button type="submit" className="form-btn" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="mx-auto h-5 w-5 animate-spin" /> : "Begin Synthesis"}
          </button>
        </form>
      </Form>
      {isSubmitting && <LoadingOverlay />}
    </>
  );
};

export default UploadForm;