"use server";

import VoiceSession from "@/database/models/voice-session.model";
import { connectToDatabase } from "@/database/mongoose";
import { StartSessionResult } from "@/types";
import { getCurrentBillingPeriodStart } from "@/lib/subscription-constants";
import { auth } from "@clerk/nextjs/server";

export const startVoiceSession = async (
  clerkId: string,
  bookId: string,
): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        const session = await VoiceSession.create({
            clerkId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0
        });

        return {
            success: true,
            sessionId: session._id.toString()
        }
    } catch (e) {
        console.error('Error starting voice session', e);
        return {
            success: false,
            error: 'Failed to start voice session. Please try again later.'
        }
    }
};

export const endVoiceSession = async (
  sessionId: string,
  durationSeconds: number,
): Promise<{ success: true } | false> => {
  if (
    typeof sessionId !== "string" ||
    !sessionId ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0
  ) {
    return false;
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    await connectToDatabase();

    const session = await VoiceSession.findOneAndUpdate(
      { _id: sessionId, clerkId: userId },
      { $set: { endedAt: new Date(), durationSeconds } },
    );

    return session ? { success: true } : false;
  } catch (e) {
    console.error("Error ending voice session", e);
    return false;
  }
};