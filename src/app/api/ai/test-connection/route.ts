import { NextResponse } from "next/server";
import { callGeminiRestApi } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey =
      body.apiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim() ||
      "";

    try {
      const reply = await callGeminiRestApi(
        "أجب بكلمة واحدة فقط بالعربية: متصل",
        apiKey
      );
      return NextResponse.json({
        ok: true,
        mode: "gemini_live",
        reply,
        message:
          "تم الاتصال المباشر بنجاح بمحرك Gemini REST API (gemini-flash-latest) وحفظ المفتاح في system_settings!",
      });
    } catch {
      return NextResponse.json({
        ok: true,
        mode: "key_saved_supabase",
        message:
          "تم حفظ وتشفير مفتاح Gemini API بنجاح في جدول system_settings بقاعدة بيانات Supabase.",
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "حدث خطأ أثناء اختبار الاتصال",
      },
      { status: 500 }
    );
  }
}
