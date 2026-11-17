import { NextResponse } from "next/server";
import { generateCampaignTasksBreakdown } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      client,
      brandKit,
      campaignTitle,
      campaignObjective,
      campaignBrief,
      teamMembers,
      apiKey,
    } = body;

    if (!client || !brandKit || !campaignTitle || !campaignBrief) {
      return NextResponse.json(
        { error: "Missing campaign or client parameters" },
        { status: 400 }
      );
    }

    const result = await generateCampaignTasksBreakdown({
      client,
      brandKit,
      campaignTitle,
      campaignObjective: campaignObjective || "Brand Awareness & Conversions",
      campaignBrief,
      teamMembers: teamMembers || [],
      apiKey,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to split campaign into tasks" },
      { status: 500 }
    );
  }
}
