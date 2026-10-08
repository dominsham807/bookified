import { NextResponse } from "next/server";
import { searchBookSegments } from "@/lib/actions/book.actions";

type JsonRecord = Record<string, unknown>;

interface VapiToolCall {
  id: string;
  name: string;
  parameters: JsonRecord;
}

const asRecord = (value: unknown): JsonRecord | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;

const parseParameters = (value: unknown): JsonRecord | null => {
  if (typeof value === "string") {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return asRecord(value);
};

const parseToolCall = (value: unknown): VapiToolCall | null => {
  const call = asRecord(value);
  if (!call || typeof call.id !== "string") {
    return null;
  }

  const functionCall = asRecord(call.function);
  const name =
    typeof functionCall?.name === "string"
      ? functionCall.name
      : typeof call.name === "string"
        ? call.name
        : "";
  const parameters = parseParameters(
    functionCall?.arguments ?? call.parameters,
  );

  if (!parameters) {
    return null;
  }

  return { id: call.id, name, parameters };
};

const normalizeToolName = (name: string) =>
  name.trim().toLowerCase().replace(/[_-]+/g, " ");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const requestBody = asRecord(body);
  const message = asRecord(requestBody?.message) ?? requestBody;
  const rawToolCalls = message?.toolCallList ?? message?.toolCalls;

  if (!Array.isArray(rawToolCalls)) {
    return NextResponse.json(
      { error: "Request must include a toolCallList" },
      { status: 400 },
    );
  }

  const toolCalls = rawToolCalls.map(parseToolCall);
  if (toolCalls.some((toolCall) => toolCall === null)) {
    return NextResponse.json(
      { error: "Tool calls must include an ID and valid parameters" },
      { status: 400 },
    );
  }

  try {
    const results = await Promise.all(
      toolCalls.map(async (toolCall) => {
        if (!toolCall) {
          return null;
        }

        if (normalizeToolName(toolCall.name) !== "search book") {
          return {
            toolCallId: toolCall.id,
            error: `Unsupported tool: ${toolCall.name}`,
          };
        }

        const bookId =
          toolCall.parameters.bookId ?? toolCall.parameters.book_id;
        const query = toolCall.parameters.query;

        if (typeof bookId !== "string" || typeof query !== "string") {
          return {
            toolCallId: toolCall.id,
            error: "Search Book requires bookId and query parameters",
          };
        }

        const matches = await searchBookSegments(bookId, query, 3);
        const result =
          matches.length > 0
            ? matches
                .map(
                  (segment) =>
                    `Segment ${segment.segmentIndex}:\n${segment.content}`,
                )
                .join("\n\n")
            : "No information found about this topic";

        return { toolCallId: toolCall.id, result };
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error handling Vapi search-book tool call", error);
    return NextResponse.json(
      { error: "Failed to search book content" },
      { status: 500 },
    );
  }
}
