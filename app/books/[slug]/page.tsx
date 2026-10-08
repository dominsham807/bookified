import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Mic, MicOff } from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getBookBySlug } from "@/lib/actions/book.actions";
import VapiControls from "@/components/VapiControls";

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

        {/* Transcript Area */}
        <VapiControls book={book} />
    </div>
  );
}