import { NextResponse } from "next/server";
import { generateMemberEvaluationAI } from "@/lib/ai/gemini";
import { calculateMemberKpiScore } from "@/lib/kpi-calculator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { member, completedTasks, reviews, apiKey } = body;

    if (!member) {
      return NextResponse.json(
        { error: "Missing team member information" },
        { status: 400 }
      );
    }

    const calculatedStats = calculateMemberKpiScore(
      completedTasks || [],
      reviews || []
    );

    const result = await generateMemberEvaluationAI({
      member,
      completedTasks: completedTasks || [],
      reviews: reviews || [],
      calculatedStats,
      apiKey,
    });

    return NextResponse.json({
      calculatedStats,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate member performance" },
      { status: 500 }
    );
  }
}
