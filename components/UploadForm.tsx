"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Image, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadSchema } from "@/lib/zod";

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
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      pdfFile: undefined,
      coverImage: undefined,
      title: "",
      author: "",
      voice: "",
    },
  });

  const handleSubmit = async (values: UploadFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.info("Book upload ready", values.title);
    setIsSubmitting(false);
  };

  const renderFileDropzone = (
    field: { value?: File; onChange: (file?: File) => void },
    inputRef: React.RefObject<HTMLInputElement | null>,
    accept: string,
    Icon: typeof FileText,
    text: string,
    hint: string,
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
        onChange={(event) => field.onChange(event.target.files?.[0])}
      />
      {field.value ? (
        <>
          <Icon className="upload-dropzone-icon" />
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
                <FormControl>{renderFileDropzone(field, pdfInputRef, "application/pdf", Upload, "Click to upload PDF", "PDF file (max 50MB)")}</FormControl>
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
                <FormControl>{renderFileDropzone(field, coverInputRef, "image/*", Image, "Click to upload cover image", "Leave empty to auto-generate from PDF")}</FormControl>
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
            name="voice"
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