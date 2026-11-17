import { NextResponse } from "next/server";
import { generateClientExecutiveReport } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client, brandKit, campaigns, tasks, apiKey } = body;

    if (!client || !brandKit) {
      return NextResponse.json(
        { error: "Missing client information" },
        { status: 400 }
      );
    }

    const result = await generateClientExecutiveReport({
      client,
      brandKit,
      campaigns: campaigns || [],
      tasks: tasks || [],
      apiKey,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate client report" },
      { status: 500 }
    );
  }
}
