import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getBookBySlug } from "@/lib/actions/book.actions";

interface BookDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
    const { userId } = await auth(); 
    console.log("User ID:", userId);
//   if (!userId) {
//     return redirectToSignIn();
//   }

  const { slug } = await params;
  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    redirect("/");
  }

  const book = result.data;

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Back to library">
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>

      <div className="vapi-main-container max-w-7xl gap-6">
        <section className="vapi-header-card w-full">
          <div className="vapi-cover-wrapper">
            <Image
              src={book.coverURL}
              alt={`Cover of ${book.title}`}
              className="vapi-cover-image"
              width={162}
              height={240}
            />
            <div className="vapi-mic-wrapper">
              <button
                type="button"
                className="vapi-mic-btn vapi-mic-btn-inactive"
                aria-label="Start conversation"
              >
                <MicOff className="size-6 text-[#212a3b]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#212a3b] sm:text-3xl">
                {book.title}
              </h1>
              <p className="mt-1 text-base text-[#3d485e]">by {book.author}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="vapi-status-indicator">
                <span
                  className="vapi-status-dot vapi-status-dot-ready"
                  aria-hidden="true"
                />
                <span className="vapi-status-text">Ready</span>
              </span>
              <span className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">
                  Voice: {book.persona ?? "Default"}
                </span>
              </span>
              <span className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">0:00/15:00</span>
              </span>
            </div>
          </div>
        </section>

        <section
          className="transcript-container min-h-[400px]"
          aria-label="Conversation transcript"
        >
          <div className="transcript-empty">
            <Mic className="mb-4 size-12 text-[#663820]" aria-hidden="true" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}