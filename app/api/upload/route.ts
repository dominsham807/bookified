import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth();

        if (!userId) {
          return NextResponse.json(
            { error: "Unauthorized: User not authenticated" },
            { status: 401 },
          );
        }

        const body = (await request.json()) as HandleUploadBody;
        
        const jsonResponse = await handleUpload({
          token: process.env.bookified_READ_WRITE_TOKEN,
          body,
          request,
          onBeforeGenerateToken: async () => {
            return {
              allowedContentTypes: [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/webp",
              ],
              addRandomSuffix: true,
              maximumSizeInBytes: MAX_FILE_SIZE,
              tokenPayload: JSON.stringify({ userId }),
            };
          },
          onUploadCompleted: async ({ blob }) => {
            console.log("File uploaded to blob: ", blob.url);

            // TODO: PostHog
          },
        });
        
        return NextResponse.json(jsonResponse);
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error occurred";
        const status = message.includes('Unauthorized') ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}