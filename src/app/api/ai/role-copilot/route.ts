import { NextResponse } from "next/server";
import { generateRoleCopilotResponse } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roleSlug, client, brandKit, task, userPrompt, apiKey } = body;

    if (!client || !brandKit || !task || !userPrompt) {
      return NextResponse.json(
        { error: "Missing required task or brand kit parameters" },
        { status: 400 }
      );
    }

    const result = await generateRoleCopilotResponse({
      roleSlug: roleSlug || task.role_slug,
      client,
      brandKit,
      task,
      userPrompt,
      apiKey,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI Copilot response" },
      { status: 500 }
    );
  }
}
